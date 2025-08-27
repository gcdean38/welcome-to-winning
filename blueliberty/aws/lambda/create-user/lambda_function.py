import json
import boto3
import uuid
import secrets
import string
from botocore.exceptions import ClientError
import os

AWS_REGION = os.environ["AWS_REGION"]
DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "AllowedUsers")
COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID")
S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")


dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
cognito = boto3.client("cognito-idp", region_name=AWS_REGION)
s3 = boto3.client("s3", region_name=AWS_REGION)

def lambda_handler(event, context):
    try:
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']

        email = body.get('email', '').strip().lower()
        first_name = body.get('firstName', '').strip()
        last_name = body.get('lastName', '').strip()
        org_name = body.get('orgName', '').strip()
        org_id = body.get('orgId', str(uuid.uuid4())).strip()
        role = body.get('role', '').strip()

        if not all([email, first_name, last_name, org_name, org_id, role]):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'All fields are required'})
            }

        temp_password = generate_temp_password()

        # Create Cognito user
        try:
            cognito.admin_create_user(
                UserPoolId=COGNITO_USER_POOL_ID,
                Username=email,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'email_verified', 'Value': 'true'},
                    {'Name': 'given_name', 'Value': first_name},
                    {'Name': 'family_name', 'Value': last_name}
                ],
                TemporaryPassword=temp_password,
                MessageAction='DELIVER'
            )
        except ClientError as e:
            if e.response['Error']['Code'] == 'UsernameExistsException':
                return {'statusCode': 400, 'body': json.dumps({'error': 'User already exists'})}
            else:
                raise e

        # DynamoDB entry
        table = dynamodb.Table(DYNAMODB_TABLE)
        table.put_item(Item={
            'email': email,
            'firstName': first_name,
            'lastName': last_name,
            'orgId': org_id,
            'orgName': org_name,
            'role': role
        })

        # Create S3 folders
        if role == 'client':
            for key in [f'clients/{org_id}/', f'clients/{org_id}/inbound/', f'clients/{org_id}/outbound/']:
                s3.put_object(Bucket=S3_BUCKET_NAME, Key=key, Body='')

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User created', 'tempPassword': temp_password, 'orgId': org_id, 'email': email})
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Internal server error'})}

def generate_temp_password():
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special = "!@#$%^&*"
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
        secrets.choice(special)
    ]
    all_chars = lowercase + uppercase + digits + special
    for _ in range(8):
        password.append(secrets.choice(all_chars))
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)
