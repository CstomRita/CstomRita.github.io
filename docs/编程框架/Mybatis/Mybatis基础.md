@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

## 机制篇

### 工作流程

我们已经大概知道了MyBatis的工作流程，按工作原理，可以分为两大步：`生成会话工厂`、`会话运行`。

![MyBatis的工作流程](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-61ac17ef-9eee-48c0-9a2d-545e1d554b13.png)

#### 构建会话工厂

构造会话工厂也可以分为两步：

![构建会话工厂](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-234a4d1b-2d44-4576-9954-26f56162750e.png)

##### 获取配置

获取配置这一步经过了几步转化，最终由生成了一个配置类Configuration实例，这个配置类实例非常重要，主要作用包括：

- 读取配置文件，包括基础配置文件和映射文件
- 初始化基础配置，比如MyBatis的别名，还有其它的一些重要的类对象，像插件、映射器、ObjectFactory等等
- 提供一个单例，作为会话工厂构建的重要参数
- 它的构建过程也会初始化一些环境变量，比如数据源

```java
public SqlSessionFactory build(Reader reader, String environment, Properties properties) {
      SqlSessionFactory var5;
      //省略异常处理
          //xml配置构建器
          XMLConfigBuilder parser = new XMLConfigBuilder(reader, environment, properties);
          //通过转化的Configuration构建SqlSessionFactory
          var5 = this.build(parser.parse());
}
```

##### 构建SqlSessionFactory

SqlSessionFactory只是一个接口，构建出来的实际上是它的实现类的实例，一般我们用的都是它的实现类DefaultSqlSessionFactory，

```java
public SqlSessionFactory build(Configuration config) {
    return new DefaultSqlSessionFactory(config);
}
```

#### 会话运行

会话运行是MyBatis最复杂的部分，它的运行离不开四大组件的配合：

![MyBatis会话运行四大关键组件](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-da477d50-209e-45b3-a003-6d63e674bd99.png)

##### MyBatis会话运行四大关键组件

![会话运行的简单示意图](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-ebd0712a-1f62-4154-b391-2cb596634710.png)

- Executor（执行器）

Executor起到了至关重要的作用，SqlSession只是一个门面，相当于客服，真正干活的是是Executor，就像是默默无闻的工程师。它提供了相应的查询和更新方法，以及事务方法。

```java
Environment environment = this.configuration.getEnvironment();
TransactionFactory transactionFactory = this.getTransactionFactoryFromEnvironment(environment);
tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
//通过Configuration创建executor
Executor executor = this.configuration.newExecutor(tx, execType);
var8 = new DefaultSqlSession(this.configuration, executor, autoCommit);
```

- StatementHandler（数据库会话器）

StatementHandler，顾名思义，处理数据库会话的。我们以SimpleExecutor为例，看一下它的查询方法，先生成了一个StatementHandler实例，再拿这个handler去执行query。

```java
 public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
    Statement stmt = null;

    List var9;
    try {
        Configuration configuration = ms.getConfiguration();
        StatementHandler handler = configuration.newStatementHandler(this.wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
        stmt = this.prepareStatement(handler, ms.getStatementLog());
        var9 = handler.query(stmt, resultHandler);
    } finally {
        this.closeStatement(stmt);
    }

    return var9;
}
```

再以最常用的PreparedStatementHandler看一下它的query方法，其实在上面的`prepareStatement`已经对参数进行了预编译处理，到了这里，就直接执行sql，使用ResultHandler处理返回结果。

```java
public <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException {
    PreparedStatement ps = (PreparedStatement)statement;
    ps.execute();
    return this.resultSetHandler.handleResultSets(ps);
}
```

- ParameterHandler （参数处理器）

PreparedStatementHandler里对sql进行了预编译处理。

```java
public void parameterize(Statement statement) throws SQLException {
    this.parameterHandler.setParameters((PreparedStatement)statement);
}
```

这里用的就是ParameterHandler，setParameters的作用就是设置预编译SQL语句的参数。

里面还会用到typeHandler类型处理器，对类型进行处理。

```java
public interface ParameterHandler {
    Object getParameterObject();

    void setParameters(PreparedStatement var1) throws SQLException;
}
```

- ResultSetHandler（结果处理器）

  我们前面也看到了，最后的结果要通过ResultSetHandler来进行处理，handleResultSets这个方法就是用来包装结果集的。Mybatis为我们提供了一个DefaultResultSetHandler，通常都是用这个实现类去进行结果的处理的。

```java
public interface ResultSetHandler {
  <E> List<E> handleResultSets(Statement var1) throws SQLException;

  <E> Cursor<E> handleCursorResultSets(Statement var1) throws SQLException;

  void handleOutputParameters(CallableStatement var1) throws SQLException;
}
```

它会使用typeHandle处理类型，然后用ObjectFactory提供的规则组装对象，返回给调用者。

#### 总结

![MyBatis整体工作原理图](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-dc142e94-8e7f-4ec6-a1f6-1d20669292ad-20230911201331348.png)

1. 读取 MyBatis 配置文件——mybatis-config.xml 、加载映射文件——映射文件即 SQL 映射文件，文件中配置了操作数据库的 SQL 语句。最后生成一个配置对象。
2. 构造会话工厂：通过 MyBatis 的环境等配置信息构建会话工厂 SqlSessionFactory。
3. 创建会话对象：由会话工厂创建 SqlSession 对象，该对象中包含了执行 SQL 语句的所有方法。
4. Executor 执行器：MyBatis 底层定义了一个 Executor 接口来操作数据库，它将根据 SqlSession 传递的参数动态地生成需要执行的 SQL 语句，同时负责查询缓存的维护。
5. StatementHandler：数据库会话器，串联起参数映射的处理和运行结果映射的处理。
6. 参数处理：对输入参数的类型进行处理，并预编译。
7. 结果处理：对返回结果的类型进行处理，根据对象映射规则，返回相应的对象

### 预编译机制

MyBaits会首先对其进行预编译，将#{参数}替换成?[占位符]，然后在执行时替换成实际传入的参数值，**并在两边加上单引号，以字符串方式处理**。

####  #{}和${}

##### #{}

`#{}`是将传入的值按照字符串的形式进行处理，如下面这条语句：

`select user_id,user_name from t_user where user_id = #{user_id}`

MyBaits会首先对其进行预编译，将#{user_ids}替换成?占位符，然后在执行时替换成实际传入的user_id值，**并在两边加上单引号，以字符串方式处理。**

下面是MyBatis执行日志：

```
10:27:20.247 [main] DEBUG william.mybatis.quickstart.mapper.UserMapper.selectById - ==>  Preparing: select id, user_name from t_user where id = ? 
10:27:20.285 [main] DEBUG william.mybatis.quickstart.mapper.UserMapper.selectById - ==> Parameters: 1(Long)
```

因为"#{}"会在传入的值两端加上单引号，所以可以很大程度上防止SQL注入。因此在大多数情况下，建议使用"#{}"。

##### ${}

`${}`是做简单的字符串替换，即将传入的值直接拼接到SQL语句中，且不会自动加单引号。将上面的SQL语句改为：

`select user_id,user_name from t_user where user_id = ${user_id}`

再观察MyBatis的执行日志：

```
10:41:32.242 [main] DEBUG william.mybatis.quickstart.mapper.UserMapper.selectById - ==>  Preparing: select id, user_name, real_name, sex, mobile, email, note, position_id from t_user where id = 1 
10:41:32.288 [main] DEBUG william.mybatis.quickstart.mapper.UserMapper.selectById - ==> Parameters: 
```


可以看到，参数是直接替换的，且没有单引号处理，这样就有SQL注入的风险。

但是在一些特殊情况下，使用${}是更适合的方式，如表名、orderby等。见下面这个例子：

`select user_id,user_name from ${table_name} where user_id = ${user_id}`

这里如果想要动态处理表名，就只能使用"${}"，因为如果使用"#{}"，就会在表名字段两边加上单引号，变成下面这样：

`select user_id,user_name from 't_user' where user_id = ${user_id}`

这样SQL语句就会报错。

#### SQL注入问题

##### 问题演示

前面说到了使用#{}可以有效防止SQL注入。那么SQL注入到底是什么呢？

考虑下面这个常见的场景：用户登录。根据前端传过来的用户名和密码，去数据库进行校验，如果查到是有效用户，则通知前端登录成功。这个场景相信大家都经历过。在数据库会执行这样一段SQL：

`select * from users where username='admin' and password=md5('admin')`

如果前端传如正确的用户名和密码，可以登录成功，这样在正常情况下没有问题。那么如果有人恶意攻击，在用户名框输入了’or 1=1#，而密码框随意输入，这个SQL语句就变为：

` select * from users where username='' or 1=1#' and password=md5('')`

“#”在mysql中是注释符，这样"#"后面的内容将被mysql视为注释内容，就不会去执行了。换句话说，上面的SQL语句等价于：

`select * from users where username='' or 1=1`

由于1=1恒成立，因此SQL语句可以被进一步简化为：

` select * from users`

这样一来，这段SQL语句可以执行成功，用户就可以恶意登录了。这样就实现了简单的SQL注入。

##### 通过MyBatis预编译防SQL注入

如前文所述，在MyBatis中，采用"${}“是简单的字符串替换，肯定无法应对SQL注入。那么”#{}"是怎样解决SQL注入的呢？

将上面的查询语句在MyBatis中实现为：

`select * from users where username=#{username} and password=md5(#{password})`

这样一来，当用户再次输入’or 1=1#，MyBatis执行SQL语句时会将其替换成：

` select * from users where username=''or 1=1#' and password=md5('')`

由于在两端加了双引号，因此输入的内容就是一个普通字符串，其中的#注释和or 1=1都不会生效，这样就无法登陆成功了，从而有效防止了SQL注入。

