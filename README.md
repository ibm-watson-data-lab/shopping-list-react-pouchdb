<!--Put badges at the very top -->
<!--change the repos -->
<!--change the tracking number -->
[![Build Status](https://travis-ci.org/IBM/watson-banking-chatbot.svg?branch=master)](https://travis-ci.org/IBM/watson-banking-chatbot)  (UPDATE AS NEEDED)
![IBM Cloud Deployments](https://metrics-tracker.mybluemix.net/stats/527357940ca5e1027fbf945add3b15c4/badge.svg) (UPDATE AS NEEDED)

<!-- fill in the blanks -->

# Create an Offline First Shopping List with React and PouchDB

In this code pattern, we will create an Offline First shopping list. Shopping List is an Offline First demo Progressive Web App built using [React](https://reactjs.org/) and [PouchDB](https://pouchdb.com/). [This app is part of a series of Offline First demo apps, each built using a different stack.](https://github.com/ibm-watson-data-lab/shopping-list).

When the reader has completed this Code Pattern, they will understand how to:

- create a shopping list web application that stores its data in a local PouchDB database.
- turn the web application into a Progressive Web App that works with or without an internet connection.
- make the app sync to and from a remote Cloudant database.

![](doc/source/images/architecture.png)

## Flow

1. Browser loads Progressive Web App's resources from the web server
2. User interacts with the web app to add shopping lists and list items
3. Data is stored locally in PouchDB
4. PouchDB syncs its data with a remote IBM Cloudant database

## Included components

* [Cloudant NoSQL DB](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db): A fully managed data layer designed for modern web and mobile applications that leverages a flexible JSON schema.


## Featured technologies

* [PouchDB](https://pouchdb.com/) - an in-browser database that can replicate to and from a remote Apache CouchDB or IBM Cloudant database.
* [React](https://reactjs.org/) - a JavaScript library for building user interfaces.
* [Material UI](http://www.material-ui.com/) - React components that implement Google's Material Design
* [Apache CouchDB](http://couchdb.apache.org/) - modern, document database hosted on your server or in the cloud.

## Live demo

To see this app in action without installing anything, simply visit https://ibm-watson-data-lab.github.io/shopping-list-react-pouchdb in a web browser or on a mobile device.

# Steps (UPDATE AS NEEDED)
* [Deploy to IBM Cloud](#deploy-to-bluemix) **OR** [Run locally](#run-locally)
* [Database and replication setup](#database-and-replication-setup)

## Deploy to IBM Cloud (UPDATE AS NEEDED)
<!--Update the repo and tracking id-->
[![Deploy to IBM Cloud](https://metrics-tracker.mybluemix.net/stats/5c5df69e10058d49cdc1f4d2fc63ce31/button.svg)](https://bluemix.net/deploy?repository=https://github.com/ibm-watson-data-lab/shopping-list-polymer-pouchdb)

1. Press the above ``Deploy to IBM Cloud`` button and then click on ``Deploy``.

1. In Toolchains, click on Delivery Pipeline to watch while the app is deployed. Once deployed, the app can be viewed by clicking `View app`.

1. To see the app and services created and configured for this code pattern, use the IBM Cloud dashboard. The app is named [app-name] with a unique suffix. The following services are created and easily identified by the [chosen prefix] prefix:
    * prefix-Service1
    * prefix-Service2

## Run locally (UPDATE AS NEEDED)
> NOTE: These steps are only needed when running locally instead of using the ``Deploy to IBM Cloud`` button.

<!-- there are MANY updates necessary here, just screenshots where appropriate -->

1. [Clone the repo](#1-clone-the-repo)
1. [Install the prerequisites](#2-install-the-prerequisites)
1. [Run the server](#3-run-the-server)
1. [Create a Cloudant or CouchDB service](#4-create-a-cloudant-or-couchdb-service)

### 1. Clone the repo (UPDATE AS NEEDED)

Clone the `shopping-list-polymer-pouchdb` locally. In a terminal, run:

```
$ git clone https://github.com/ibm-watson-data-lab/shopping-list-polymer-pouchdb
```

### 2. Install the prerequisites (UPDATE AS NEEDED)

First, install [Polymer CLI](https://github.com/Polymer/polymer-cli) using [npm](https://www.npmjs.com/) (we assume you have pre-installed [Node.js](https://nodejs.org/)):

    npm install --global polymer-cli

Second, install [Bower](https://bower.io/) using [npm](https://www.npmjs.com):

    npm install --global bower

Third, install the [Bower npm resolver](https://github.com/mjeanroy/bower-npm-resolver):

    npm install --global bower-npm-resolver

### 3. Run the server (UPDATE AS NEEDED)

This command serves the app at `http://127.0.0.1:8081` and provides basic URL routing for the app:

    polymer serve

### 4. Create a Cloudant or CouchDB service (UPDATE AS NEEDED)

PouchDB can synchronize with CouchDB and compatible servers. To run and test locally, you can install CouchDB. Alternatively, you can use a hosted Cloudant NoSQL DB service for your remote DB.

#### Installing Apache CouchDB (UPDATE AS NEEDED)

[Install CouchDB 2.1](http://docs.couchdb.org/en/2.1.0/install/index.html). Instructions are available for installing CouchDB 2.1 on Unix-like systems, on Windows, on Mac OS X, on FreeBSD, and via other methods.

Configure CouchDB for a [single-node setup](http://docs.couchdb.org/en/2.1.0/install/setup.html#single-node-setup), as opposed to a cluster setup. Once you have finished setting up CouchDB, you should be able to access CouchDB at `http://127.0.0.1:5984/`. Ensure that CouchDB is running and take note of your admin username and password.

#### Creating a Cloudant NoSQL DB service (UPDATE AS NEEDED)

Sign up for an [IBM Cloud](https://console.ng.bluemix.net/) account, if you do not already have one.

Once you are logged in to IBM Cloud, create a new Cloudant instance on the [Cloudant NoSQL DB Bluemix Catalog](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db) page. This should take you to a page representing the newly-created service instance. Click the "Service credentials" link. You should have one set of service credentials listed. Click "View credentials" which should show you a JSON object containing your service credentials. Copy the value for the `url` key to your clipboard (the value will be in the form of `https://username:password@uniqueid-bluemix.cloudant.com`).

## Database and replication setup (UPDATE AS NEEDED)
1. [Create the remote database](#1-create-the-remote-database)
1. [Enable CORS](#2-enable-cors)
1. [Set the replication target](#3-set-the-replication-target)

### 1. Create the remote database (UPDATE AS NEEDED)

Use your Cloudant or CouchDB dashboard to create a database. Select the Databases icon on the left and then use the `Create Database` button to create the "shopping-list" database.
The Shopping List app can be used locally before the database exists, but cannot sync
until the remote database is completed.

![](doc/source/images/create_db.png)

### 2. Enable CORS (UPDATE AS NEEDED)

Cross-Origin Resource Sharing (CORS) needs to be enabled. Use your Cloudant or CouchDB dashboard to enable it. The CORS options are under the account settings or config depending on your version. Enable CORS and restrict the domain as needed for security.

![](doc/source/images/enable_cors.png)

### 3. Set the replication target (UPDATE AS NEEDED)

Run the Shopping List app and use the `Replicator` form to enter your Database URL.
If you use the Bluemix Cloudant URL taken from the service credentials as described above, the URL includes user and password GUIDs.

Add `/shopping-list` to the URL to connect to the database that you created.

![](doc/source/images/replicator.png)

<!--Edit as appropriate, update screenshot-->
# Using the app (UPDATE AS NEEDED)

The app allows you to create a shopping list by clicking on the plus sign. Click on the list to see its items. Then, you can add items to the list by clicking the plus sign. There is a checkbox to allow you to mark the items complete as you buy load up your cart.

When you have not configured your Replication Target or when you are offline, the lists will not sync. One good way to test this is to run two browsers. You can use Chrome and Firefox and have different lists in each.

When you go online and have the database and CORS enabled and the Replication Target is set, the shopping lists will sync. You will then be able to use both lists from either browser.

![](doc/source/images/shopping_lists.png)

## Running the app (UPDATE AS NEEDED)

## Running the tests (UPDATE AS NEEDED)

## Deploying to GitHub Pages (UPDATE AS NEEDED)

# Privacy Notice (UPDATE AS NEEDED)

Refer to https://github.com/IBM/metrics-collector-service#privacy-notice.

## Disabling Deployment Tracking (UPDATE AS NEEDED)

To disable tracking, simply remove ``require('metrics-tracker-client').track();`` from the ``app.js`` file in the top level directory.

<!--Include any relevant links-->

# Links
* [Live Demo](https://ibm-watson-data-lab.github.io/shopping-list-react-pouchdb)
* [More Shopping List Sample Apps](https://github.com/ibm-watson-data-lab/shopping-list)
* [Offline First](http://offlinefirst.org/)
* [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/)
* [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
* [Web App Manifest](https://w3c.github.io/manifest/)
* [React](https://reactjs.org/)
* [PouchDB](https://pouchdb.com/)
* [Apache CouchDB](https://couchdb.apache.org/)
* [IBM Cloudant](https://www.ibm.com/cloud/cloudant)
* [Material UI](http://www.material-ui.com/) 

# License
[Apache 2.0](LICENSE)