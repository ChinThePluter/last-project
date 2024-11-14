from datetime import datetime

while True :
    now = datetime.now()

    formatted_date = now.strftime('%Y-%m-%d %H:%M:%S')

    milliseconds = int(
        now.microsecond / 1000
    )

    data = f"{formatted_date}:{milliseconds:02}"
    
    print(data)