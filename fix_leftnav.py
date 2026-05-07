import sys

path = 'src/components/system/IotaLeftNav.jsx'
with open(path, 'r') as f:
    content = f.read()

# We need to find the correct 의사결정 로그 and change it
# Let's see context around '의사결정 로그'
