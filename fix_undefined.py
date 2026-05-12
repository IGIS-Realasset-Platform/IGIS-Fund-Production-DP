with open('src/components/system/shared/Fund421DetailCard.jsx', 'r') as f:
    content = f.read()

# Fix prop definition
content = content.replace("const Fund421DetailCard = ({ id, vehicleId, title, totalAmountStr, data, toggleContent }) => {", "const Fund421DetailCard = ({ id, vehicleId, title, totalAmountStr, data, toggleContent, onInstClick }) => {")

# Fix usage
content = content.replace("onClick={() => handleInstClick(", "onClick={() => onInstClick && onInstClick(")

with open('src/components/system/shared/Fund421DetailCard.jsx', 'w') as f:
    f.write(content)

