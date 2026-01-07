# create_table.py
import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

try:
    table = dynamodb.create_table(
        TableName='ampai-users',
        KeySchema=[
            {'AttributeName': 'userId', 'KeyType': 'HASH'}
        ],
        AttributeDefinitions=[
            {'AttributeName': 'userId', 'AttributeType': 'S'},
            {'AttributeName': 'email', 'AttributeType': 'S'}
        ],
        GlobalSecondaryIndexes=[
            {
                'IndexName': 'email-index',
                'KeySchema': [
                    {'AttributeName': 'email', 'KeyType': 'HASH'}
                ],
                'Projection': {'ProjectionType': 'ALL'}
            }
        ],
        BillingMode='PAY_PER_REQUEST'
    )
    
    print("⏳ Creating table...")
    table.wait_until_exists()
    print("✅ Table created successfully!")
    print(f"Table status: {table.table_status}")
    
except Exception as e:
    if 'ResourceInUseException' in str(e):
        print("⚠️  Table 'ampai-users' already exists.")
        print("You need to either:")
        print("1. Delete it and run this script again, OR")
        print("2. Add the email-index manually via AWS Console")
    else:
        print(f"❌ Error: {e}")
