FROM drydock/microbase:{{%TAG%}}

ADD . /home/shippable/admiral

RUN cd /home/shippable/admiral && npm install

ENTRYPOINT ["/home/shippable/admiral/boot.sh"]
EXPOSE 50003
