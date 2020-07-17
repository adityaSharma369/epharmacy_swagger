number=$(jq .version package.json)
version=$(echo $number | tr -d '"')
cd ecommerce
sudo docker build --no-cache --build-arg version_default=$version -t ecommerce:$version -f Dockerfile . 
sudo docker tag ecommerce:$version adityasharma369/ecommerce:$version
sudo docker login --username=adityasharma369 --password=Adi@.3690
sudo docker push adityasharma369/ecommerce:$version
cd ../gateway
sudo docker build --no-cache --build-arg version_default=$version -t gateway:$version -f Dockerfile . 
sudo docker tag gateway:$version adityasharma369/gateway:$version
sudo docker login --username=adityasharma369 --password=Adi@.3690
sudo docker push adityasharma369/gateway:$version
cd ../inventory
sudo docker build --no-cache --build-arg version_default=$version -t inventory:$version -f Dockerfile . 
sudo docker tag inventory:$version adityasharma369/inventory:$version
sudo docker login --username=adityasharma369 --password=Adi@.3690
sudo docker push adityasharma369/inventory:$version
cd ../user
sudo docker build --no-cache --build-arg version_default=$version -t user:$version -f Dockerfile . 
sudo docker tag user:$version adityasharma369/user:$version
sudo docker login --username=adityasharma369 --password=Adi@.3690
sudo docker push adityasharma369/user:$version
