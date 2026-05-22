import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type NotificationRecord = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type?: string | null;
  reference_id?: string | null;
};

type FirebaseServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
  token_uri?: string;
};

const jsonHeaders = { "Content-Type": "application/json" };
const tokenUrl = "https://oauth2.googleapis.com/token";
const fcmScope = "https://www.googleapis.com/auth/firebase.messaging";

function base64UrlEncode(input: string | ArrayBuffer): string {
  const bytes = typeof input === "string"
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function privateKeyToArrayBuffer(privateKey: string): ArrayBuffer {
  const pem = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(pem);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function createSignedJwt(serviceAccount: FirebaseServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: fcmScope,
    aud: serviceAccount.token_uri ?? tokenUrl,
    iat: now,
    exp: now + 3600,
  };
  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyToArrayBuffer(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedJwt),
  );
  return `${unsignedJwt}.${base64UrlEncode(signature)}`;
}

async function getAccessToken(serviceAccount: FirebaseServiceAccount): Promise<string> {
  const assertion = await createSignedJwt(serviceAccount);
  const response = await fetch(serviceAccount.token_uri ?? tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Firebase access token: ${await response.text()}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Firebase access token response did not include access_token");
  }
  return data.access_token;
}

async function sendFcmMessage(
  serviceAccount: FirebaseServiceAccount,
  accessToken: string,
  token: string,
  notification: NotificationRecord,
): Promise<Response> {
  return await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: {
            notification_id: notification.id,
            type: notification.type ?? "",
            reference_id: notification.reference_id ?? "",
          },
        },
      }),
    },
  );
}

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record = payload.record as NotificationRecord | undefined;

    if (payload.table !== "iota_notifications" || payload.type !== "INSERT" || !record) {
      return new Response(
        JSON.stringify({ message: "Ignored non-notification webhook" }),
        { headers: jsonHeaders, status: 200 },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const serviceAccountStr = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are missing");
    }
    if (!serviceAccountStr) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing");
    }

    const serviceAccount = JSON.parse(serviceAccountStr) as FirebaseServiceAccount;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: tokensData, error } = await supabase
      .from("fcm_tokens")
      .select("fcm_token")
      .eq("user_id", record.user_id);

    if (error) {
      throw error;
    }

    const tokens = [...new Set(tokensData?.map((item) => item.fcm_token).filter(Boolean) ?? [])];
    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tokens found", notification_id: record.id }),
        { headers: jsonHeaders, status: 200 },
      );
    }

    const accessToken = await getAccessToken(serviceAccount);
    const results = [];
    for (const token of tokens) {
      const response = await sendFcmMessage(serviceAccount, accessToken, token, record);
      results.push({
        token,
        ok: response.ok,
        status: response.status,
        body: await response.text(),
      });
    }

    return new Response(
      JSON.stringify({
        message: "Push send completed",
        notification_id: record.id,
        success_count: results.filter((result) => result.ok).length,
        failure_count: results.filter((result) => !result.ok).length,
        results,
      }),
      { headers: jsonHeaders, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: jsonHeaders,
      status: 500,
    });
  }
});
