pipeline {
    agent any

    tools {
        nodejs 'node25'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Test: Can we successfully pull the latest code from GitHub?
                checkout scm
                echo 'Code checkout successful!'
            }
        }

        stage('Environment Check') {
            steps {
                // Test: Is the Node.js environment ready inside the container?
                echo 'Checking Node.js environment...'
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Test: Can we install dependencies smoothly? 
                // This verifies network connectivity and package.json integrity.
                echo 'Mocking dependency installation...'
                sh 'npm install'
            }
        }

        stage('Mock Deploy') {
            steps {
                // Do not execute the real WeChat upload command, just print a success message
                echo 'Mock Deployment: Assuming the code has been successfully bundled!'
                echo 'Everything is working fine. Replace this with the real "npm run deploy" anytime.'
            }
        }
    }

    post {
        success {
            echo 'Congratulations! The test pipeline is fully connected! The GitHub Webhook and Jenkins Docker agent are working perfectly together.'
        }
        failure {
            echo 'Test run failed. Please check the logs above to see which step caused the error.'
        }
    }
}