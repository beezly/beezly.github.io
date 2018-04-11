---
layout: post
title: "Provisioning VMs Using Ephemeral SSH Keys in Terraform"
description: ""
category: 
tags: [terraform]
---
When provisioning Linux VMs in the cloud, it is useful to use SSH keys to bootstrap the VMs with some initial configuration. This post explains how to provision your VMs using a disposable SSH key.

<!--more-->

Terraform helps by providing the `tls_private_key` resource type.

    resource "tls_private_key" "bootstrap_private_key" {
        algorithm = "RSA"
        rsa_bits  = "4096"
    }

In the terraform VM resource I configure the VM to use the public key. In this example, I'm using Azure so the resource would be an `azurerm_virtual_machine`. The value of `path` in the ssh_keys attribute must be set to the path of the admin user's `authorized_hosts` file. The `key_data` is set to the `public_key_openssh` attribute of the `bootstrap_private_key` resource created above.

    resource "azurerm_virtual_machine" "demo_vm" {
    
        <attributes not relevant to this example>

        os_profile {
            admin_username = "setup"
        }

        os_profile_linux_config {
            disable_password_authentication = true

            ssh_keys = [{
                path     = "/home/setup/.ssh/authorized_keys"
                key_data = "${chomp(tls_private_key.bootstrap_private_key.public_key_openssh)}"
            }]
        }
    }

Any provisioners that need to connect to the remote host can then be configured to use the private key from the `tls_private_key` resource.

        connection {
            type        = "ssh"
            host        = "${azurerm_public_ip.bastion_public_ip.ip_address}"
            user        = "${var.os_admin_username}"
            private_key = "${tls_private_key.bootstrap_private_key.private_key_pem}"
        }

In this case terraform copies across some bootstrap code onto the VM which provisions my user accounts. Finally, it deletes the admin user's `authorized_keys` file to ensure that the ephemeral key cannot be used to log in again.

        provisioner "file" {
            source      = "${path.module}/some-files"
            destination = "/tmp/some-files"
        }

        provisioner "remote-exec" {
            inline = [
            "sudo bash /tmp/some-files/bootstrap.sh",
            "sudo rm -f /home/setup/.ssh/authorized_keys",
            ]
        }

# Limitations

Terraform will store the private key in the state file, and in the event that a VM resource is destroyed and re-created, the same key will be used to provision the resource. Of course, the state file should be stored securely anyway, but in an ideal world it would be possible to only define this resource for the duration of the `apply`. Maybe some new features in terraform in the future will help with this.

It is possible to partially workaround this, by always tainting the `tls_private_key` after an apply, which would guarantee that the key is recreated on the next `apply` execution.