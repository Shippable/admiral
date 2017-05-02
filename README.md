# Admiral - the Shippable installer

## CLI

```
  Usage:
    $./admiral.sh <command> [flags]

  Examples:
    $sudo ./admiral.sh install
    $sudo ./admiral.sh --help

  Commmands:
    install         Run Shippable installation
    help            Print this message
```

## Installing Shippable Enterprise with GitHub Auth

### Provisioning
- All services and core components will run on a single instance. The minimum
  requirements for the instance are:
    - 4 core (min)
    - 8 Gb memory
    - 100 Gb disk
    - Ubuntu 14.04 LTS
- The following ports must be exposed on this instance: 22, 80, 443, 2222, 5432,
  5672, 6379, 8200, 15672, 50000, 50001, 50002, and 50003.

### Running the installer
#### Log into the instance and install `git`
```
$ sudo apt-get update
$ sudo apt-get install git-core
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
