FROM ubuntu:25.04

RUN apt update

RUN apt install -y npm 

# Install dependencies for AWS CLI
RUN apt-get update && apt-get install -y \
    unzip \
    curl

# Download and install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

EXPOSE 3000

CMD ["/bin/bash"]

WORKDIR /src

# Ensure that when for example running npx ampx sandbox, it is using the Version1 AWS Profile
ENV AWS_PROFILE=saml

# # Commands
# #  podman build . -t npm-dev:0.2
# #  alias drn="podman run --name npm-dev -v ~/code_d700qtgithub/react-ai-full-stack-app:/src -v ~/.aws:/root/.aws -t -i npm-dev:0.2"
# #  alias drn="podman run --name npm-dev2 -v ~/code_d700qtgithub/react-ai-full-stack-app:/src -v ~/.aws:/root/.aws -t -i npm-dev:0.2"
# #  alias dsn="podman start -i npm-dev"
# -v ~/.aws:/home/python/.aws 

