# Admiral - the Shippable installer

## CLI

```
  Usage:
    ./admiral.sh <command> [flags]

  Examples:
    ./admiral.sh install --help

  Commmands:
    install         Run Shippable installation
    upgrade         Run silent upgrade without any prompts
    help            Print this message
    clean           Remove shippable containers and configurations
    info            Print information about current installation
```

## Docs
Full documentation for all the components is available [here](http://docs.shippable.com/reference/admiral/)

## Installing Shippable Enterprise with GitHub Auth

### Provisioning
- All services and core components will run on a single instance. The
  requirements for the instance are:
    - 4 core (min)
    - 8 Gb memory
    - 100 Gb disk
    - Ubuntu 14.04 LTS
- The following ports must be exposed on this instance:
    - 22: ssh into the machine
    - 80: internal gitlab server api endpoint
    - 443: internal gitlab server secure api endpoint
    - 2222: internal gitlab server ssh port
    - 5432: database
    - 5672: amqp
    - 15672: amqp admin
    - 6379: redis
    - 8200: vault
    - 50000: Shippable api
    - 50001: Shippable front end
    - 50002: Shippable marketing ui
    - 50003: Shippable admin panel

### Load balancers
- The usual (and recommended) way of exposing Shippable service end points is
  via loadbalancers. The LBs are not required to be exposed to the public
  facing internet but should be accessible to all users in a VPN. A typical
  setup creates following routing:

  User (shippable.mycompany.com) -> Route 53 -> Internal LB -> Shippable API
  (running on one or more machines)

  Shippable requires 4 loadbalancers with listeners on these ports:
    - **API, port 50000**: Shippable api will be used by all the microservices
        and should be available via IP/DNS.
    - **WWW, port 50001**: This service is what users access to use Shippable.
    - **Admin, port 50003**: This is where the Shippable admin panel runs
    - **Message queue, ports 443, 5671 and 15671**: required to access the
      message queue admin panel and for build nodes to connect if they belong
      to a different VPC than the one in which the message queue is provisioned.

### Running the installer
#### Log into the instance and install `git` and `ssh`
```
$ sudo apt-get update
$ sudo apt-get install git-core ssh
```

#### Upgrade kernel
- If installer is running on AWS ubuntu 14.04 ami, then the kernel needs to be
  updated. Run following commands to update kernel to 3.19

```
$ sudo apt-get update
$ sudo apt-get install linux-generic-lts-vivid
$ sudo reboot //restart is required after kernel upgrade
```

#### Clone the installer
```
$ git clone https://github.com/Shippable/admiral.git
$ cd admiral
```

#### Select a version
```
$ git checkout v5.5.1
```
- In the cloned installer, `git checkout` the tag for the version that you
  intend to install.


#### Run the installation
```
$ sudo ./admiral.sh install
```

- Enter the installer keys provided by Shippable, the public facing IP address
  of the machine running the installer, and a strong password for the database
  when prompted.  Enter 'Y' to confirm each input.

- The installer will then install dependencies, including Docker.

- When this step of the installation is complete, the installer prints the login
  information for the admin panel, which looks like this:
```
<... some logs... >
|___ Admiral container successfully running
|___ Go to <machine ip>:50003 to access Admiral
|___ Login Token: <login token>
|___ Installation successfully completed !!!
```

- Open this address in a web browser and use the login token to
  continue the installation.

