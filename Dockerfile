FROM drydock/u${ADMIRAL_OS}microbase:master

ADD . /home/shippable/admiral

RUN ./home/shippable/admiral/common/scripts/x86_64/Ubuntu_${ADMIRAL_OS}.04/install_psql.sh

RUN cd /home/shippable/admiral && npm install --unsafe-perm && \
  ./node_modules/bower/bin/bower --allow-root install && grunt build

RUN mkdir -p /var/run/shippable/logs

RUN wget https://download.docker.com/linux/static/stable/x86_64/docker-17.06.0-ce.tgz -O /tmp/docker.tar.gz && \
    tar -xzvf /tmp/docker.tar.gz -C /tmp && \
    mv /tmp/docker/* /usr/bin && \
    rm -rf /tmp/docker.tar.gz /tmp/docker

ENTRYPOINT ["/home/shippable/admiral/boot.sh"]
EXPOSE 50003
