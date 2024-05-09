FROM rockylinux:8
MAINTAINER dvrcic@srce.hr
RUN groupadd user -g 1000 && useradd -u 1000 -g 1000 user -m -d /home/user -s /bin/zsh
RUN dnf -y update; dnf clean all
RUN dnf -y install epel-release && \
    dnf -y install \
      ack \
      ctags \
      fortune-mod \
      git \
      glibc-all-langpacks \
      iproute \
      libpq \
      make \
      mc \
      memcached \
      ncurses-compat-libs \
      net-tools \
      passwd \
      procps-ng \
      python3-devel \
      python3-pip \
      python3-setuptools \
      python39 \
      python39-mod_wsgi \
      rpmdevtools \
      rsync \
      sudo \
      supervisor \
      telnet \
      the_silver_searcher \
      tmux \
      tree \
      vim \
      wget \
      xmlsec1-openssl \
      yum-utils \
      zsh
RUN pip install -U pip; pip3 install -U pip
RUN dnf module install -y nodejs:18
RUN ln -s /home/user /home/dvrcic
RUN passwd -d root
VOLUME [ "/sys/fs/cgroup" ]
RUN sed -r -i 's/(^Defaults.*always_set_home)/# \1/' /etc/sudoers
RUN echo -e "user ALL=(ALL) NOPASSWD: ALL\nDefaults env_keep += \"HOME\"" >> /etc/sudoers
COPY collectstatic.sh run-django-server.sh run-frontdev-server.sh syncsite.sh safety.sh /home/user
USER user
WORKDIR /home/user
RUN sudo python3.9 -m venv /opt/hrzoo-signup
RUN sudo sh -c '\
  . /opt/hrzoo-signup/bin/activate \
  && pip install -U pip \
  && pip3 install -r https://raw.githubusercontent.com/vrdel/hrzoo-hpc-users-front/main/requirements.txt \
  && pip install git+https://github.com/vrdel/hrzoo-hpc-users-front'
RUN curl -sfL https://git.io/chezmoi | sh
COPY chezmoi-config-apply.sh /home/user
CMD ["sudo", "/usr/bin/supervisord", "-nc",  "/etc/supervisord.conf"]
