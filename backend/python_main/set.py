import os
import subprocess
import urllib.request
import zipfile
import shutil

def run_command(command):
    process = subprocess.Popen(command, shell=True)
    process.communicate()

def main():
    # 현재 폴더의 절대경로를 얻기
    current_path = os.path.abspath(os.getcwd())
    print(f"Current directory: {current_path}")
    
    # requirements.txt를 설치
    requirements_path = os.path.join(current_path, 'requirements.txt')
    if os.path.exists(requirements_path):
        run_command(f"pip install -r {requirements_path}")
    else:
        print("requirements.txt 파일을 찾을 수 없습니다.")
    
    # app.py 실행
    app_path = os.path.join(current_path, 'app.py')
    if os.path.exists(app_path):
        run_command(f"python {app_path}")
    else:
        print("app.py 파일을 찾을 수 없습니다.")

if __name__ == "__main__":
    main()
