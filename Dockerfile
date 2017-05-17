FROM drydock/microbase:{{%TAG%}}

ADD . /home/shippable/admiral

RUN ./home/shippable/admiral/common/scripts/install_psql.sh

RUN ./home/shippable/admiral/common/scripts/install_reqs.sh

RUN cd /home/shippable/admiral && npm install --unsafe-perm && \
  ./node_modules/bower/bin/bower --allow-root install && grunt build

RUN mkdir -p /var/run/shippable/logs


ENTRYPOINT ["/home/shippable/admiral/boot.sh"]
EXPOSE 50003
