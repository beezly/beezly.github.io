---
layout: post
title: "Migrating an LVM logical volume onto a new block device without downtime"
description: ""
category: 
tags: [linux]
---

Recently we had a problem at work that required us to move a filesystem from local disk onto an iSCSI device. Normally you could just create a new filesystem on the iSCSI device, use a tool like rsync to move the data across and remount the new filesystem in place of the old one. 

<!--more-->

Unfortunately, this filesystem is in use nearly all the time and it is difficult to schedule downtime on this system, so we needed to come up with a different strategy.

Luckily, the filesystem is built on disks which use Logical Volume Manager, so we were able to use that to migrate across to the new iSCSI storage.

## Step 1 - Creating the new Physical Volume ##

This should be familiar to those using LVM. Add the new partition as a physical volume using the <code>pvcreate</code> command;

    pvcreate <newPV>
    
In this case, the disk I'm adding is <code>sdb1</code>.

    root@voltaire [~]# pvcreate /dev/sdb1
      Writing physical volume data to disk "/dev/sdb1"
      Physical volume "/dev/sdb1" successfully created
      
## Step 2 - Add the new Physical Volume to the existing Volume Group ##

On this machine, we have a volume group called <code>VolGroup00</code>. You can see information about the existing VGs using <code>vgdisplay</code>:

    root@voltaire [~]# vgdisplay
      --- Volume group ---
      VG Name               VolGroup00
      System ID
      Format                lvm2
      Metadata Areas        2
      Metadata Sequence No  14
      VG Access             read/write
      VG Status             resizable
      MAX LV                0
      Cur LV                6
      Open LV               5
      Max PV                0
      Cur PV                2
      Act PV                2
      VG Size               29.88 GB
      PE Size               32.00 MB
      Total PE              956
      Alloc PE / Size       699 / 21.84 GB
      Free  PE / Size       257 / 8.03 GB
      VG UUID               uTkXkf-MNXf-dYoQ-DRDS-s5y1-73kX-H0ylTH

I add the new PV to this VG using <code>vgextend</code>:

    vgextend <VG> <newPV>

This produces:

    root@voltaire [~]# vgextend VolGroup00 /dev/sdb1
      Volume group "VolGroup00" successfully extended

## Step 3 - Mirror the existing logical volume onto the new physical volume ##

Using <code>lvconvert</code> we can change the properties of the existing logical volume to require mirroring. We can use this to move data across to the new device without stopping the filesystem and unmounting it.

First we can take a look at the information for the LV we're migrating using <code>lvdisplay</code>.

    lvdisplay <LV>
    
In this case I'm interested in the PV at /dev/Volgroup00/webusers

    root@voltaire [~]# lvdisplay /dev/VolGroup00/webusers
      --- Logical volume ---
      LV Name                /dev/VolGroup00/webusers
      VG Name                VolGroup00
      LV UUID                cOAHtW-YWND-hItx-eYbI-WZAb-2CID-Oe2qZM
      LV Write Access        read/write
      LV Status              available
      # open                 0
      LV Size                2.00 GB
      Current LE             64
      Segments               1
      Allocation             inherit
      Read ahead sectors     auto
      - currently set to     256
      Block device           253:5


Using <code>lvconvert</code>, we tell LVM to make this a mirrored volume using the new PV we added a few moments ago:

    lvconvert -m1 --mirrorlog core <VG>/<LV> <newPV>
    
This tells LVM to create 1 mirror copy (-m1), using an in-memory log. In-memory is fine for our purposes as we're only using this mirror to store data temporarily whilst it is migrated. 

    root@voltaire [~]# lvconvert -m1 --mirrorlog core VolGroup00/webusers /dev/sdb1
      VolGroup00/webusers: Converted: 7.8%
      VolGroup00/webusers: Converted: 54.7%
      VolGroup00/webusers: Converted: 100.0%

If we now examine the LV with <code>lvdisplay</code> we'll see a significant change:

    root@voltaire [~]# lvdisplay /dev/VolGroup00/webusers
      --- Logical volume ---
      LV Name                /dev/VolGroup00/webusers
      VG Name                VolGroup00
      LV UUID                cOAHtW-YWND-hItx-eYbI-WZAb-2CID-Oe2qZM
      LV Write Access        read/write
      LV Status              available
      # open                 0
      LV Size                2.00 GB
      Current LE             64
      Mirrored volumes       2
      Segments               1
      Allocation             inherit
      Read ahead sectors     auto
      - currently set to     256
      Block device           253:5

The LV now has two mirrored volumes and the data is now on the iSCSI device.

## Step 4 - Detaching the original physical volume ##

We can use use <code>lvconvert</code> again to remove the old physical volume by removing the mirror property from the LV. 

    lvconvert -m0 <VG>/<LV> <oldPV>...
    
In my case I am removing /dev/sda2 and /dev/sda3. If you are migrating from multiple old PVs, you can specify them all. 

    root@voltaire [~]# lvconvert -m0 VolGroup00/webusers /dev/sda2 /dev/sda3
      Logical volume webusers converted.
  
<code>lvdisplay -m</code> should now show that the data is on the new PV.

    root@voltaire [~]# lvdisplay -m /dev/VolGroup00/webusers
      --- Logical volume ---
      LV Name                /dev/VolGroup00/webusers
      VG Name                VolGroup00
      LV UUID                cOAHtW-YWND-hItx-eYbI-WZAb-2CID-Oe2qZM
      LV Write Access        read/write
      LV Status              available
      # open                 0
      LV Size                2.00 GB
      Current LE             64
      Segments               1
      Allocation             inherit
      Read ahead sectors     auto
      - currently set to     256
      Block device           253:5
    
      --- Segments ---
      Logical extent 0 to 63:
        Type		linear
        Physical volume	/dev/sdb1
        Physical extents	0 to 63

## Step 5 - Remove the old PV from the VG and destroy it ## 

Once you are no longer using the old PV, you can remove it from the volume group and destroy it. 

    vgreduce <VG> <oldPV>
    pvremove <oldPV>

Finished!
