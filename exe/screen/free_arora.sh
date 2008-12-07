i=0
while [ `ps -ef|grep arora.${i}|grep -v grep|wc -l` -eq 1 ]
do 
((i++))
done
echo $i
