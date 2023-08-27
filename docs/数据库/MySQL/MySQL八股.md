@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>





## 事务

### 持久性

####  事务还没提交的时候，redo log 能不能被持久化到磁盘

事务还没有提交的时候，redo log 是有可能被持久化到磁盘的。

redolog 的具体落盘操作是这样的：在事务运行的过程中，MySQL 会先把日志写到 redolog buffer 中，等到事务真正提交的时候，再统一把 redolog buffer 中的数据写到 redolog 文件中。不过这个从 redolog buffer 写到 redolog 文件中的操作也就是 write 并不就是落盘操作了，这里仅仅是把 redolog 写到了文件系统的 page cache 上，最后还需要执行 fsync 才能够实现真正的落盘。

也就是说，redolog 其实存在三种状态：

1. 事务执行过程中，存在 MySQL 的进程内存中的 redolog buffer 中
2. 事务提交，执行 write 操作存在文件系统的 page cache 中，但是没有执行 fsync 操作持久化到磁盘
3. 事务提交，执行 fsync 操作持久化到磁盘

relog的刷盘时机有三种情况：

第一种情况：InnoDB 有一个后台线程，每隔 1 秒轮询一次，具体的操作是这样的：调用 write 将 redolog buffer 中的日志写到文件系统的 page cache，然后调用 fsync 持久化到磁盘。而在事务执行中间过程的 redolog 都是直接写在 redolog buffer 中的，也就是说，一个没有提交的事务的 redolog，也是有可能会被后台线程一起持久化到磁盘的。

第二种情况：innodb_flush_log_at_trx_commit 设置是 1时，每次事务提交的时候，都执行 fsync 将 redolog 直接持久化到磁盘，假设事务 A 执行到一半，已经写了一些 redolog 到 redolog buffer 中，这时候有另外一个事务 B 提交，事务 B 要把 redolog buffer 里的日志全部持久化到磁盘，这时候，就会带上事务 A 在 redolog buffer 里的日志一起持久化到磁盘。

第三种情况：redo log buffer 占用的空间达到 redolo buffer 大小(由参数 innodb_log_buffer_size 控制，默认是 8MB)一半的时候，后台线程会主动写盘。不过由于这个事务并没有提交，所以这个写盘动作只是 write 到了文件系统的 page cache，仍然是在内存中，并没有调用 fsync ，此时并不会落盘。



