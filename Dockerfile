#FROM drydock/microbase:{{%TAG%}}
FROM drydock/microbase:master

ADD . /home/shippable/admiral
RUN cd /home/shippable/admiral && npm install

RUN mkdir -p /var/run/shippable/logs

ENTRYPOINT ["/home/shippable/admiral/boot.sh"]
EXPOSE 50003
