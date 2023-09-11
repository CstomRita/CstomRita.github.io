@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

## 概念篇

### ORM是什么？

ORM（Object Relational Mapping），对象关系映射，是一种为了解决关系型数据库数据与简单Java对象的映射关系的技术。

ORM是通过使用描述对象和数据库之间映射的元数据，将程序中的对象自动持久化到关系型数据库中。

### Mybatis是什么？

Mybatis 是一个半对象关系映射框架，它内部封装了 JDBC，开发时只需要关注 SQL 语句本身，不需要花费精力去处理加载驱动、创建连接、创建statement 等繁杂的过程。

同时，MyBatis 可以使用 XML 或注解来配置和映射原生信息，将 POJO 映射成数据库中的记录，避免 JDBC 代码和手动设置参数以及获取结果集。

### Mybatis为什么是半ORM？

Hibernate属于全自动ORM映射工具，使用Hibernate查询关联对象或者关联集合对象时，可以根据对象关系模型直接获取，所以它是全自动的。

而Mybatis在查询关联对象或关联集合对象时，需要手动编写SQL来完成，所以，被称之为半自动ORM映射工具。

### Mybatis和Hibernate的区别？

两种都是对JDBC的封装，属于持久层的框架，两者的区别主要在于：

- 映射关系不同。Hibernate是全自动映射框架，SQL编写量较少，但不够灵活，适合于需求相对稳定的场景。而Mybatis属于半自动映射框架，需要编写较多SQL，但是比较灵活，适合于需求变化频繁，快速迭代的项目。
- 两者移植性不同。由于Hibernate无需自行编写SQL语句，支持数据库无关性；Mybatis需要手动编写 SQL，工作量相对大些。直接使用SQL语句操作数据库，不支持数据库无关性，但sql语句优化容易。

## 机制篇

### Mybatis的使用过程和生命周期？

MyBatis基本使用的过程大概可以分为这么几步：

1. 创建SqlSessionFactory，可以从配置或者直接编码来创建SqlSessionFactory。
2. 通过SQLSessionFactory创建SqlSession实例。
3. 获取Mapper对象，并通过SqlSession实例，执行SQL语句，获得执行结果。

其中：

- SqlSessionFactory 是用来创建SqlSession的，相当于一个数据库连接池，是应用级的生命周期，且是单例的。
- SqlSession相当于JDBC中的Connection，SqlSession 的实例不是线程安全的，因此是不能被共享的，所以它的最佳的生命周期是一次请求或一个方法
- Mapper映射器是绑定映射语句的接口，其实例从 SqlSession 中获得的，它的生命周期在sqlsession事务方法之内。
- 如果和Spring框架结合，Spring框架可以利用ThreadLocal创建线程安全的、基于事务的bean，那么以上均是单例应用级别的生命周期。

### Mybatis的工作原理？

Mybatis的工作流程大致分为两步，一是生成会话；二是在会话中运行SQL。

在生成会话中：

1、Mybatis首先会通过读取配置文件，加载映射文件，生成一个配置对象Configuration。

2、第二步通过环境配置信息，生成一个会话工厂实例SQLSessionFactory，类似于连接池，可创建sqlSession对象，该对象中包含了执行 SQL 语句的所有方法。

有了sqlSession对象后，即可执行SQL语句，在执行过程中：

1、MyBatis 底层定义了一个 Executor 接口来操作数据库，首先它将根据 SqlSession 传递的参数动态地生成需要执行的 SQL 语句。

2、经过ParameterHandler对输入参数类型进行处理后，StatementHandler对数据库进行操作。

3、查询后的结果通过ResultHandler对返回结果的类型进行处理，根据对象映射规则，返回相应的对象。

### 说说Mybatis的一级、二级缓存？

1. 一级缓存: 是基于 HashMap的本地缓存，其存储作用域为SqlSession，各个SqlSession之间的缓存相互隔离，当session结束后，该 SqlSession 中的所有 Cache 就将清空，MyBatis默认打开一级缓存。
2. 二级缓存与一级缓存其机制相同，默认也是采用HashMap的存储，不同之处在于其存储作用域为全局的Mapper，可以在多个SqlSession之间共享。默认情况下，不打开二级缓存，要开启二级缓存，使用二级缓存属性类需要实现Serializable序列化接口，用来保存对象的状态。

### 为什么Mapper接口不需要实现类？

这里使用到了动态代理的思想，Mapper映射是通过**动态代理**实现的。

- Configuration初始化的时候会扫描xml中的所有文件，拿出他们各自的namespace，通过addMapper方法来查找是否有一个对应的namespace.class，这就是为什么接口全限名和namespace保持一致的原因，如果找到这个类则放到knownMappers的哈希表中。
- 运行时使用`getMapper`方法获取一个Mapper实例，扫描knownMappers来查找这class是不是一个mapper，如果是一个mapper的话，则newInstance生成一个代理对象
- 调用代理对象的invoke方法，最终会调用mapperMethod.execute方法，将sqlSession和运行时的参数都传入其中执行SQL。

### Mybatis都有哪些Executor执行器？

Mybatis有三种基本的Executor执行器，SimpleExecutor、ReuseExecutor、BatchExecutor。

- **SimpleExecutor**：每执行一次update或select，就开启一个Statement对象，用完立刻关闭Statement对象。
- **ReuseExecutor**：执行update或select，以sql作为key查找Statement对象，存在就使用，不存在就创建，用完后，不关闭Statement对象，而是放置于Map<String, Statement>内，供下一次使用。简言之，就是重复使用Statement对象。
- **BatchExecutor**：执行update（没有select，JDBC批处理不支持select），将所有sql都添加到批处理中（addBatch()），等待统一执行（executeBatch()），它缓存了多个Statement对象，每个Statement对象都是addBatch()完毕后，等待逐一执行executeBatch()批处理。与JDBC批处理相同。

### Mybatis的懒加载机制？

懒加载/延迟加载机制的应用场景是进行关联查询时，只有用到关联对象数据时，才去查询。Mybatis支持association关联对象和collection关联集合对象的延迟加载，association指的就是一对一，collection指的就是一对多查询。

懒加载机制的优点是先从单表查询，需要时再从关联表去关联查询，⼤⼤提⾼数据库性能，因为查询单表要比关联查询多张表速度要快。

懒加载机制也是通过动态代理的方式实现，懒加载代理对象执行方法是会被拦截执行invoke方法，在invoke方法中会判断该属性是否需要延迟加载，如果会就执行事先储存好的查询sql并调用set方法为该懒加载对象的属性赋值，之后再继续执行原方法。

## 应用篇

### 在mapper中如何传递多个参数？

1. 使用顺序传参法，`#{}`中用0、1、2代表传入参数的顺序。这种方法不建议使用，sql层表达不直观，且一旦顺序调整容易出错。
2. 使用`@Param`注解传参，传递变量名称。这种方法在参数不多的情况还是比较直观的。
3. 使用Map传参，`#{}`传递的是Map中的key值，适合传递多个参数，且参数易变能灵活传递的情况。
4. 最常用的是使用JavaBean传参，传递的是成员变量。代码可读性强，业务逻辑处理方便，适用于实体类和数据库表单对应的情况。

```sql
public User selectUser(String name, int deptId);

<select id="selectUser" resultMap="UserResultMap">
    select * from user
    where user_name = #{0} and dept_id = #{1}
</select>
-------------------------------------------------------------------
public User selectUser(@Param("userName") String name, int @Param("deptId") deptId);

<select id="selectUser" resultMap="UserResultMap">
    select * from user
    where user_name = #{userName} and dept_id = #{deptId}
</select>
-------------------------------------------------------------------
public User selectUser(Map<String, Object> params);

<select id="selectUser" parameterType="java.util.Map" resultMap="UserResultMap">
    select * from user
    where user_name = #{userName} and dept_id = #{deptId}
</select>
-------------------------------------------------------------------
public User selectUser(User user);

<select id="selectUser" parameterType="com.jourwon.pojo.User" resultMap="UserResultMap">
    select * from user
    where user_name = #{userName} and dept_id = #{deptId}
</select>
```

### 实体类属性名和表中字段名不一样 ，怎么办?

有两种方法：

1. 通过在查询的SQL语句中定义字段名的别名，让字段名的别名和实体类的属性名一致。
2. 通过resultMap 中的<result>来映射字段名和实体类属性名的一一对应的关系。

```xml
<select id="getOrder" parameterType="int" resultType="com.jourwon.pojo.Order">
       select order_id id, order_no orderno ,order_price price form orders where order_id=#{id};
</select>
---------------------------------------------------------------
<select id="getOrder" parameterType="int" resultMap="orderResultMap">
  select * from orders where order_id=#{id}
</select>
<resultMap type="com.jourwon.pojo.Order" id="orderResultMap">
    <!–用id属性来映射主键字段–>
    <id property="id" column="order_id">
    <!–用result属性来映射非主键字段，property为实体类属性名，column为数据库表中的属性–>
  <result property ="orderno" column ="order_no"/>
  <result property="price" column="order_price" />
</resultMap>
```

### Mybatis是否可以映射枚举类？

可以映射，通过自定义TypeHandler即可。

TypeHandler有两个作用，一是完成从javaType至jdbcType的转换，二是完成jdbcType至javaType的转换，在使用Mybatis时不需要再显示转换，体现为setParameter()和getResult()两个方法。

通过自定义TypeHandler可以实现表单类型和JavaBean类型的映射。

### Mybatis中默认的TypeHandler有哪些？

Mybatis中默认的TypeHandler有很多，例如BooleanTypeHandler、ByteTypeHandler 、ShortTypeHandler 、IntegerTypeHandler 、LongTypeHandler 、FloatTypeHandler、DoubleTypeHandler 、BigDecimalTypeHandler 、StringTypeHandler 、BlobInputStreamTypeHandler 、ByteArrayTypeHandler 、BlobTypeHandler 、DateTypeHandler 、ObjectTypeHandler 等等，基本实现了JavaBean基本类型和数据库基本类型的互相转换，基本可以满足大部分业务需求的话。

### #{}和${}的区别?

- `#{}`是占位符，预编译处理，将参数替换成问号占位符，然后在执行时替换成实际传入的参数值，并在两边加上单引号，以字符串方式处理；`${}`是拼接符，字符串替换，没有预编译处理，直接将传入的值拼接到SQL语句中，且不会自动加单引号。
- `#{}` 因为有预编译处理，两端会加引号，恶意的SQL被传入也会被当做一个普通字符串，不会对SQL结构造成变化，因此可以有效的防止SQL注入，提高系统安全性；而`${}` 不能防止SQL 注入。

### 如何获得生成的主键？

标签中添加：`keyProperty="主键名称" `即可，完成回填主键。

### Mybatis中动态SQL怎么写？

- 可以选择`if`语句，组成where语句
- 可以选择`choose-when-otherwise`语句，动态组成where语句
- 可以使用<where>标签，用在所有的查询条件都是动态的情况
- 可以使用<set>标签， 用在动态更新时
- 可以用<foreach>标签，用于集合遍历

### Mybatis批量更新？

- 可以使用foreach标签，可以在SQL语句中进行迭代一个集合。这种模式下，要定义好集合的属性，是LIst、Array还是Map。

- 可以使用Mybatis内置的batch执行器，batchExecutor重复使用已经预处理的语句，并且批量执行所有更新语句，可以用于批量处理。 

  但batch模式也有自己的问题，比如在Insert操作时，在事务没有提交之前，是没有办法获取到自增的id，在某些情况下不符合业务的需求。

```java
//批量保存方法测试
@Test  
public void testBatch() throws IOException{
    SqlSessionFactory sqlSessionFactory = getSqlSessionFactory();
    //可以执行批量操作的sqlSession
    SqlSession openSession = sqlSessionFactory.openSession(ExecutorType.BATCH);

    //批量保存执行前时间
    long start = System.currentTimeMillis();
    try {
        EmployeeMapper mapper = openSession.getMapper(EmployeeMapper.class);
        for (int i = 0; i < 1000; i++) {
            mapper.addEmp(new Employee(UUID.randomUUID().toString().substring(0, 5), "b", "1"));
        }

        openSession.commit();
        long end = System.currentTimeMillis();
        //批量保存执行后的时间
        System.out.println("执行时长" + (end - start));
        //批量 预编译sql一次==》设置参数==》10000次==》执行1次   677
        //非批量  （预编译=设置参数=执行 ）==》10000次   1121

    } finally {
        openSession.close();
    }
}
```

### Mybatis分页？

MyBatis使用RowBounds对象进行分页，它是针对ResultSet结果集执行的内存分页，而非物理分页。

可以在sql内直接书写带有物理分页的参数来完成物理分页功能，也可以使用分页插件来完成物理分页。

常见的分页插件PageHelper等，是使用Mybatis提供的插件接口，拦截query方法，在执行查询的时候重写sql，添加`limit`物理分页语句和物理分页参数完成的。



