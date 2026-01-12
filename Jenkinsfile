pipeline {
    agent any

    environment {
        // Docker configuration
        DOCKER_IMAGE = 'tpethkar/udial-backend'
        DOCKER_TAG = 'latest'
        
        // Credentials IDs (ensure these are set up in Jenkins -> Credentials)
        DOCKER_HUB_CREDS = 'docker-hub-credentials'
        EC2_SSH_CREDS    = 'ssh-deploy-key'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Lint') {
            steps {
                sh 'corepack enable'
                sh 'pnpm install --frozen-lockfile'
                sh 'pnpm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'pnpm run test'
            }
        }

        stage('Build & Push to Docker Hub') {
            when { branch 'main' }
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    // Uses the PAT you provided (stored in Jenkins as 'docker-hub-credentials')
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                        sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            when { branch 'main' }
            steps {
                // Connect to EC2 via SSH and trigger deployment
                // This assumes the docker-compose and nginx files are already on the server
                sshagent(['ssh-deploy-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@13.232.36.255 "
                            cd /home/ubuntu/udial-backend && \
                            docker compose -f docker-compose.udial.yml pull && \
                            docker compose -f docker-compose.udial.yml up -d
                        "
                    '''
                }
            }
        }
    }

    post {
        always {
            // Clean workspace to save disk space
            cleanWs()
        }
        success {
            echo "CI/CD Pipeline finished successfully for uDIAL Backend."
        }
        failure {
            echo "Pipeline failed! Please check the transition logs."
        }
    }
}
