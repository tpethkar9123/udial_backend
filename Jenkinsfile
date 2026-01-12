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
                // Copy local ansible files from volume mount into workspace (ignored by git)
                sh 'cp -r /var/lib/jenkins/ansible ./ansible'
                
                // Trigger the Ansible playbook for deployment
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
