FROM rockylinux:8
MAINTAINER dvrcic@srce.hr
RUN groupadd user -g 1000 && useradd -u 1000 -g 1000 user -m -d /home/user -s /bin/zsh
RUN dnf -y update; dnf clean all
RUN dnf -y install epel-release && \
    dnf -y install \
      procps-ng \
      ack \
      ctags \
      fortune-mod \
      git \
      glibc-all-langpacks \
      iproute \
      make \
      memcached \
      mc \
      net-tools \
      ncurses-compat-libs \
      passwd \
      python3-devel \
      python39 \
      python39-mod_wsgi \
      python3-pip \
      python3-setuptools \
      rpmdevtools \
      rsync \
      sudo \
      supervisor \
      telnet \
      the_silver_searcher \
      tree \
      tmux \
      vim \
      wget \
      yum-utils \
      zsh
RUN pip install -U pip; pip3 install -U pip
RUN dnf module install -y nodejs:18
RUN ln -s /home/user /home/dvrcic
RUN passwd -d root
VOLUME [ "/sys/fs/cgroup" ]
RUN sed -r -i 's/(^Defaults.*always_set_home)/# \1/' /etc/sudoers
RUN sed -r -i 's/(^.unix_http_server)/; \1/' /etc/supervisord.conf
RUN sed -r -i 's/^(file.*supervisor.sock)/; \1/' /etc/supervisord.conf
RUN echo -e "user ALL=(ALL) NOPASSWD: ALL\nDefaults env_keep += \"HOME\"" >> /etc/sudoers
COPY collectstatic.sh run-django-server.sh run-frontdev-server.sh syncsite.sh /home/user
USER user
WORKDIR /home/user
RUN curl -sfL https://git.io/chezmoi | sh
CMD ["sudo", "/usr/bin/supervisord", "-nc",  "/etc/supervisord.conf"]
