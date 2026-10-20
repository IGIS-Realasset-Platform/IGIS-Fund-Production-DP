---
title: "별도 도우미 설치 없이 폴더를 여는 방법과 제한"
description: "웹 화면에서 Windows 탐색기를 열 수 있는 공식 조건과 설치 없는 대안을 구분합니다."
---

# 별도 도우미 설치 없이 폴더를 여는 방법

확인일: 2026-10-20. 이 문서는 가능한 방식과 필요한 회사 승인을 설명합니다. 설치·레지스트리 수정·브라우저 정책 변경·탐색기 실행은 하지 않았습니다.

## 결론

**직원마다 새 도우미를 설치하지 않는 방법은 있습니다. 다만 현재 외부 웹사이트가 아무 설정 없이 모든 직원 PC의 임의 폴더를 한 번에 여는 방법은 공식적으로 보장되지 않습니다.** 웹사이트가 PC 프로그램을 마음대로 실행하지 못하게 하는 브라우저의 보안 경계 때문입니다. 회사가 이미 사용하는 Edge 정책이나 OneDrive 환경을 활용하는 방법과, 웹 링크·경로 복사를 이용하는 방법을 구분해야 합니다.

| 방법 | 새 도우미 설치 | 실제로 열리는 것 | 필요한 조건·한계 |
|---|---|---|---|
| SharePoint/OneDrive의 HTTPS 폴더 링크 | 없음 | 브라우저의 해당 폴더 | 해당 자료가 실제 클라우드에 있어야 하며 회사 자료 권한이 필요합니다. Windows 탐색기 직접 열기와 다릅니다. |
| 기존 OneDrive 동기화 사용 | 이미 설치·로그인·동기화했다면 추가 도우미 없음 | 탐색기의 동기화 폴더 | 공유폴더를 OneDrive에 연결하는 준비가 필요합니다. 기존 서버폴더 경로를 임의로 클라우드 주소로 바꾸는 기능은 아닙니다. |
| 회사가 관리하는 Edge의 공식 파일 링크 정책 | 새 앱 없음 | Windows 탐색기의 폴더 또는 파일의 상위폴더 | 회사 IT가 해당 웹사이트와 파일 위치를 인트라넷 범위로 승인하고 정책을 배포해야 합니다. 현재 적용됐다고 확인한 상태가 아닙니다. |
| SharePoint의 ‘파일 탐색기에서 보기’ | 별도 자체 도우미 없음 | SharePoint 문서 라이브러리의 탐색기 보기 | 관리되는 Windows·Edge 정책·SharePoint 관리자 설정이 필요합니다. Microsoft는 이 방식보다 OneDrive 동기화를 권장합니다. |
| 폴더 경로 복사 | 없음 | 사용자가 탐색기 주소창에 붙여넣은 폴더 | 자동 열기는 아니지만 별도 설치·정책 변경 없이 사용할 수 있는 기본 대안입니다. PC에서 실제 경로 접근 권한이 있어야 합니다. |
| 회사가 이미 설치한 전용 프로그램의 링크 | 이미 설치·등록돼 있어야 함 | 해당 프로그램이 지원하는 화면 | 공식 지원 주소·회사 승인을 확인해야 합니다. 존재하지 않는 연결 규칙을 웹사이트에서 만들어 쓸 수는 없습니다. |

## Edge에서 탐색기를 직접 여는 공식 조건

Microsoft의 `IntranetFileLinksEnabled`는 Windows용 Edge95 이상에서 지원됩니다. 다음 조건이 함께 맞아야 합니다.

1. 버튼이 있는 출발 페이지가 **HTTPS이면서 인트라넷 영역**이어야 합니다.
2. 대상 `file:` 주소도 **인트라넷 영역의 파일 또는 폴더**여야 합니다.
3. 해당 Edge 정책이 활성화돼 있어야 합니다.

조건을 만족하는 폴더 링크는 그 폴더를 탐색기로 엽니다. 파일 링크는 파일을 실행하는 대신 상위폴더를 열고 해당 파일을 선택합니다. 정책을 끄거나 설정하지 않으면 파일 링크가 열리지 않는 것이 기본 동작입니다. Edge 외 다른 브라우저와 모바일에 같은 동작을 보장하는 기능은 아닙니다. `https://localhost/`는 예외적으로 차단되고, loopback 주소도 기본적으로 인터넷 영역이므로 ‘로컬 페이지를 하나 더 띄우면 된다’는 해결책은 아닙니다. [Microsoft 공식 정책](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/IntranetFileLinksEnabled)

회사 IT는 정책을 중앙에서 배포할 수 있으므로 직원마다 도우미를 설치할 필요는 없습니다. 그러나 이는 **무설치이지만 회사 정책 설정은 필요한 방식**입니다. 도메인을 회사와 유사하게 바꾸거나 Vercel을 사용한다는 사실만으로 인트라넷 조건이 성립하지 않습니다. [Edge 정책 중앙 관리](https://learn.microsoft.com/en-us/deployedge/configure-microsoft-edge)

정책 검토 시 앱의 정확한 승인 주소와 회사 파일서버만 좁게 다뤄야 합니다. 여러 사람의 서비스가 들어 있는 `*.vercel.app` 전체를 허용하는 식의 광범위한 설정은 제안하지 않습니다. 또한 ‘신뢰할 수 있는 사이트’ 영역과 ‘로컬 인트라넷’ 영역은 서로 다릅니다. 하나를 등록하면 다른 조건까지 충족되는 것이 아닙니다. [Microsoft 보안 영역 정의](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-internetexplorer#allowsitetozoneassignmentlist)

이 정책은 파일서버의 접근권한·사내망/VPN 연결·존재하지 않는 폴더를 대신 해결하지 않습니다. 앱에 로그인할 수 있다는 사실도 회사 공유폴더 권한이 있다는 뜻은 아닙니다. 임의 외부 서버나 실행파일을 열도록 허용해서는 안 되며, 회사 승인 경로의 폴더 열기만 검토해야 합니다.

## SharePoint와 기존 OneDrive는 어디까지 가능한가요?

실제 문서가 SharePoint/OneDrive에 있다면 웹 폴더 링크를 저장해 브라우저에서 바로 여는 것은 무설치 방식입니다. 이미 회사 OneDrive 앱을 사용하고 있다면 라이브러리·폴더를 연결해 탐색기에서 접근할 수 있습니다. Microsoft는 폴더 바로가기 또는 라이브러리 동기화를 설명하고 있으며, 동기화에는 PC별 준비와 사용자의 자료 권한이 필요합니다. **플랫폼 버튼이 모든 직원의 서로 다른 로컬 동기화 경로를 알아내어 자동으로 여는 것까지 제공하는 것은 아닙니다.** 계정별 동기화 경로나 기존 로그인 정보를 읽거나 회사 동기화 설정을 변경하지 않았습니다. [공식 동기화 안내](https://support.microsoft.com/en-us/sharepoint/sync/sync-sharepoint-and-teams-files-with-your-computer)

별도 기능인 SharePoint ‘파일 탐색기에서 보기’는 Edge의 `ConfigureViewInFileExplorer`와 SharePoint 관리자의 `ViewInFileExplorerEnabled` 설정이 함께 필요합니다. 회사가 관리하는 지원 Windows 환경과 지속 로그인 조건도 있습니다. 이 기능은 승인한 SharePoint 라이브러리용이며 임의 서버폴더·개인C드라이브를 여는 범용 우회 수단이 아닙니다. 인증 쿠키가 관여하므로 회사 관리자 검토 없이 관련 설정이나 쿠키를 복사하지 않습니다. Microsoft는 현재 OneDrive 동기화를 우선 권장합니다. [공식 기능 설명](https://learn.microsoft.com/en-us/sharepoint/sharepoint-view-in-edge), [Edge 전용 정책](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/configureviewinfileexplorer)

## 비슷해 보여도 같은 해결책이 아닌 것

- `ms-excel:`·`ms-word:`는 설치된 Office에서 지정 문서를 여는 방식입니다. 폴더를 Windows 탐색기로 여는 기능이 아닙니다. [Office URI 공식 정의](https://learn.microsoft.com/en-us/office/client-developer/office-uri-schemes)
- `search-ms:`는 Windows 검색을 요청하는 규칙입니다. 폴더 직접 열기 성공으로 표시하거나 이를 브라우저의 파일 링크 제한 우회로 사용하지 않습니다. [Windows 검색 공식 정의](https://learn.microsoft.com/en-us/windows/win32/search/-search-3x-wds-qryidx-searchms)
- 임의의 `explorer:`·자체 이름 주소를 만든다고 Windows에 그 기능이 생기지 않습니다. 주소를 처리하는 프로그램이 이미 설치·등록돼 있어야 합니다. Windows 앱 실행 API에 관한 문서는 일반 웹사이트에 임의 프로그램 실행 권한을 부여하는 문서가 아닙니다. [Windows 주소와 기본 앱](https://learn.microsoft.com/en-us/windows/apps/develop/launch/launch-default-app)
- 웹앱을 PWA로 설치하거나 새 창으로 여는 것만으로 PC의 파일 접근·프로그램 실행 권한을 얻는다고 가정하지 않습니다. 브라우저 경고를 끄거나 임의 스크립트·실행파일·바로가기 파일을 내려받는 우회 방식은 검토안에 포함하지 않습니다.

## 현재 PC에서 읽기만 한 결과

정확한 정책 이름과 승인된 앱 주소 하나만 조회했습니다. 다른 사이트 목록·계정·쿠키·저장 자격정보는 열람하지 않았습니다.

| 읽은 위치 | 관측 결과 |
|---|---|
| `HKCU\SOFTWARE\Policies\Microsoft\Edge`의 `IntranetFileLinksEnabled` | 해당 Edge 정책 키 없음 |
| `HKLM\SOFTWARE\Policies\Microsoft\Edge`의 `IntranetFileLinksEnabled` | Edge 정책 키는 있으나 해당 값 없음 |
| HKCU/HKLM 정책의 `Internet Settings\ZoneMapKey`에서 정확한 앱 주소 `https://igis-development-project-platform.vercel.app` | 두 정책 키 모두 없음 |

따라서 조사한 레지스트리 위치에서 현재 이 기능이 활성화된 증거는 없습니다. 이는 모든 회사 관리경로·자동 영역판정·브라우저 프로필의 최종 적용정책을 전수검사했다는 뜻은 아닙니다. 실제 `edge://policy` 결과와 대상 파일 주소의 영역판정·권한은 미검증이며 탐색기를 실행해 성공한 상태도 아닙니다.

## 이 플랫폼에 적합한 선택

지금 추가 설치와 정책 변경을 하지 않는 범위에서는 **클라우드 주소가 있으면 ‘웹에서 열기’, 서버·로컬 경로이면 ‘경로 복사’**가 사실에 맞는 동작입니다. 서버 경로를 임의로 업로드하거나 SharePoint로 옮길 필요는 없습니다.

‘누르면 Windows 탐색기가 해당 폴더를 바로 열어야 한다’가 필수이면, 새 도우미 설치부터 진행하지 말고 회사 IT에 **지원 Edge 정책의 좁은 범위 중앙 적용이 가능한지** 확인하는 것이 공식적인 무도우미 설치 대안입니다. 회사가 승인하면 그 환경에서 별도 시험으로 검증할 수 있습니다. 현재는 가능 조건 조사만 했으며 적용·배포·성공 표시는 하지 않았습니다.

문서 검토: 개념·방식 비교·필요 이유·보안 경계·대안·현재 관측/미검증을 분리했습니다. 기존 설정 이력은 확인되지 않았으므로 추측한 과거 설명과 실행 지침·설정 명령은 의도적으로 넣지 않았습니다.
