Kubernetes Best Practices book code example
-------------------------------------------

This repository contains a tested versions of the code and manifests of the `Journal Application` described in the first chapter of the book, for running on a Kubernetes cluster.

For educational purposes, the single-node version of Kubernetes - minikube - is quite suitable. Here are some points to consider when using the minikube:

1. You must enable the ingress addon:

`minikube addons enable ingress`

2. It is necessary to allocate disk space in advance for user PersistentVolumeClaim objects (`/pvc/pv0001.yaml`).

3. Edit the ingress/ingress.yaml manifest regarding the host domain name description ( `- host: ...`) to suit your environment.

4. Note to Docker Desktop users: to access the application published through the ingress, you need to run the following command in a separate terminal:

`minicube tunnel`

and after that you can access the application through the address 127.0.0.1 (https://minikube.sigs.k8s.io/docs/start/).

5. The code examples assume that the Redis Database stores a JSON array. To check the journal data recording, you can use the console utility `curl`:

`curl -X POST -H "Content-Type: application/json" -d '{"name": "John"}' http://<your-host-or-ip>/api`

6. The `fileserver` microservice, designed for distributing static files such as HTML, CSS, JavaScript, currently produces just a simple response with `pod's hostname` from the Nginx web server. You can create such files so that this microservice produces a page with a web user interface for accessing journal entries.

7. The `redis` microservice uses the password from the `secret` manifest, located in the `frontend` folder. Don't forget to create that secret object before running the redis microservice!

8. If you want to build a Docker image (`myfrontend`) with a daemon that is located inside a minikube, then you can do this as described on the page https://minikube.sigs.k8s.io/docs/handbook/pushing/#1-pushing-directly-to-the-in-cluster-docker-daemon-docker-env :

`eval $(minikube docker-env)`
`docker build -t myfrontend .`

"""Tip 1:""" Remember to turn off the `imagePullPolicy:Always` (use `imagePullPolicy:IfNotPresent` or `imagePullPolicy:Never`) in your yaml file. Otherwise Kubernetes won’t use your locally build image and it will pull from the network.

OR (https://minikube.sigs.k8s.io/docs/handbook/pushing/#8-building-images-to-in-cluster-container-runtime) :

`minikube image build -t myfrontend .` (It may not works, if you are behind the proxy)

9. If you are behind the proxy, see: https://minikube.sigs.k8s.io/docs/handbook/vpn_and_proxy/

10. Folder `old` contains some original files from forked repo.


