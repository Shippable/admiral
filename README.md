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

## Installing Shippable Enterprise with Github Auth

### Provisioning
- All services and core components will run on a single instance. The minimum
  requirements for the instance are
    - 4 core (min)
    - 8 Gb memory
    - 100 Gb disk
    - Ubuntu 14.04 LTS

### Running the installer
- log in the instance and install `git`
```
$ sudo apt-get update
$ sudo apt-get install git-core
```

- clone the installer
```
$ git clone https://github.com/Shippable/admiral.git
$ cd admiral
```

- Run the installation
```
$ sudo ./admiral.sh install
```

- After the installer bootstraps the system by installing dependencies and
  docker, the first prompt will be to enter the IP address of the machine. Find
  the public facing IP address of the machine running the installer and enter
  here. Press 'Y' to confirm.

- The second prompt will be to enter database password. Enter a strong password
  and press 'Y' to confirm.

- The installer then prints the login information for the admin panel which
  looks like this.
```
<... some logs... >
|___ Admiral container successfully running
|___ Go to <machine ip>:50003 to access Admiral
|___ Login Token: <login token>
|___ Installation successfully completed !!!
```

- Open the address and use the login token to visit admiral panel
