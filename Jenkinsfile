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

    tools {
        nodejs "node20"
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
                sh 'npx prisma generate'
                sh 'pnpm run lint'
            }
        }

        stage('Test & 75% Code Coverage') {
            steps {
                sh 'pnpm run test:cov'
            }
        }

        stage('Build & Push to Docker Hub') {
            when { 
                anyOf {
                    branch 'main'
                    expression { return env.BRANCH_NAME == 'main' }
                    expression { return env.GIT_BRANCH?.contains('main') }
                }
            }
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
            when { 
                anyOf {
                    branch 'main'
                    expression { return env.BRANCH_NAME == 'main' }
                    expression { return env.GIT_BRANCH?.contains('main') }
                }
            }
            steps {
                // Copy Ansible files from Jenkins volume mount (not in git)
                // Ensure you have mounted your local ansible folder to /var/lib/jenkins/ansible in Jenkins container
                sh 'cp -r /var/lib/jenkins/ansible ./ansible'
                
                ansiblePlaybook(
                    playbook: 'ansible/deploy.yml',
                    inventory: 'ansible/inventory.ini',
                    credentialsId: "${EC2_SSH_CREDS}"
                )
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
