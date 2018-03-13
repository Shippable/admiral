FROM drydock/u16microbase:master

ADD . /home/shippable/admiral

RUN ./home/shippable/admiral/common/scripts/x86_64/Ubuntu_16.04/install_psql.sh

RUN cd /home/shippable/admiral && npm install --unsafe-perm && \
  ./node_modules/bower/bin/bower --allow-root install && grunt build

RUN mkdir -p /var/run/shippable/logs

ENTRYPOINT ["/home/shippable/admiral/boot.sh"]
EXPOSE 50003
