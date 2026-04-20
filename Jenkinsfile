pipeline {
    agent any

    tools {
        nodejs 'node22'
    }

    environment {
        WECHAT_KEY_PATH = credentials('WECHAT_MINIPROGRAM_KEY')
        WECHAT_APPID = credentials('WECHAT_APPID')
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Test: Can we successfully pull the latest code from GitHub?
                checkout scm
                echo 'Code checkout successful!'

                echo "Code checkout successful! Commit SHA: ${env.GIT_COMMIT}"
                
                // 3. Now it is safe to notify GitHub that we are starting
                // Note: GitHub Status API uses 'pending', 'success', 'failure', or 'error'
                publishGitHubStatus('pending', 'Pipeline Started: Checking out code...')
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

        stage('Compile & Check') {
            steps {
                // 2. Update check to Compiling
                publishGitHubStatus('pending', 'Compiling Code: Running miniprogram-ci...')

                // Now both variables are available in the environment
                sh 'npm run check' 
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

            // 3. Send SUCCESS check
            publishGitHubStatus('success', 'Compilation Passed. Click Details to view QR.')

            // show QR fig
            archiveArtifacts artifacts: 'preview_QR.jpg', allowEmptyArchive: true
        }
        failure {
            echo 'Test run failed. Please check the logs above to see which step caused the error.'
            
            // 4. Send FAILURE check
            publishGitHubStatus('failure', 'Compilation Failed. Check Jenkins logs.')
        }
    }
}

// ==============================================================================
// Helper Function: Call GitHub Status API directly (Bulletproof Version)
// ==============================================================================
def publishGitHubStatus(state, description) {
    script {
        // Use the native Jenkins Git variable
        def commitSha = env.GIT_COMMIT

        def repoPath = 'days0102/StocksFlow' 
        def contextName = 'Jenkins / Deep Compilation Check'
        
        // Build JSON payload as a string to avoid file read/write issues
        def payloadString = """{"state": "${state}", "target_url": "${env.RUN_DISPLAY_URL}", "description": "${description}", "context": "${contextName}"}"""

        // Use your correctly configured credential ID here
        withCredentials([string(credentialsId: 'Jenkins_to_Github_StockFlow', variable: 'GITHUB_TOKEN')]) {
            sh """
            curl -s -o /dev/null -w "%{http_code}" -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer \${GITHUB_TOKEN}" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            https://api.github.com/repos/${repoPath}/statuses/${commitSha} \
            -d '${payloadString}'
            """
        }
    }
}