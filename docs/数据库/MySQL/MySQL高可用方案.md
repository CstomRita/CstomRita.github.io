@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

> 参考《MySQL高可用解决方案——从主从复制到InnoDB Cluster架构》 作者：徐轶韬

高可用方案按照可用性排序依次为：

1. 主从复制
2. InnoDB ReplicaSet
3. 使用共享存储/虚拟化技术的主备服务器
4. 组复制
5. InnoDB Cluster、
6. nnoDB ClusterSet
7. NDB Cluster。

![image-20231221173506467](MySQL%E9%AB%98%E5%8F%AF%E7%94%A8%E6%96%B9%E6%A1%88.assets/image-20231221173506467.png)