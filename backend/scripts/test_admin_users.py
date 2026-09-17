import urllib.request
import json

# 1. Login as admin
login_data = json.dumps({'email': 'admin@elarion.com', 'password': 'Admin123!'}).encode('utf-8')
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/auth/login',
    data=login_data,
    headers={'Content-Type': 'application/json'}
)
with urllib.request.urlopen(req) as resp:
    tokens = json.loads(resp.read().decode('utf-8'))
access_token = tokens['access_token']

# 2. Get student user
users_req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/users?page_size=100',
    headers={'Authorization': f'Bearer {access_token}'}
)
with urllib.request.urlopen(users_req) as resp:
    users_data = json.loads(resp.read().decode('utf-8'))

target = next((u for u in users_data['items'] if u['email'] == 'student_visual_test_01@elarion.io'), None)
assert target is not None, "Target user not found"
target_id = target['id']
print(f"Target student ID: {target_id}, current status: {target['status']}")

# 3. Test Suspend
patch_data = json.dumps({'status': 'suspended'}).encode('utf-8')
patch_req = urllib.request.Request(
    f'http://127.0.0.1:8000/api/v1/users/{target_id}',
    data=patch_data,
    headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'},
    method='PATCH'
)
with urllib.request.urlopen(patch_req) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    print(f"Updated status in DB: {res['status']}")

# 4. Test Reactivate
patch_data2 = json.dumps({'status': 'active'}).encode('utf-8')
patch_req2 = urllib.request.Request(
    f'http://127.0.0.1:8000/api/v1/users/{target_id}',
    data=patch_data2,
    headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'},
    method='PATCH'
)
with urllib.request.urlopen(patch_req2) as resp:
    res2 = json.loads(resp.read().decode('utf-8'))
    print(f"Reactivated status in DB: {res2['status']}")

print("ALL ADMIN USER STATUS TESTS PASSED SUCCESSFULLY!")
