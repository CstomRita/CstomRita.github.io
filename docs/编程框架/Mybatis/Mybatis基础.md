@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

## 使用篇

### 配置

#### 映射文件的加载方式

![image-20231217123635730](Mybatis%E5%9F%BA%E7%A1%80.assets/image-20231217123635730.png)

共有四种方法

- <mapper resource>标签：mapper映射文件的文件路径导入，使用的mapper标签的resource属性

- <mapper url>标签：网络资源路径，使用的mapper标签的url属性
- <mapper class>标签：接口的全限定名导入，使用的是mapper标签的class属性 (基于接口的代理模式开发)
- <package name>标签：包扫描形式，加载所有的mapper映射文件 使用的是 package标签

#### 事务配置

在mybatis核心配置文件中 envirment中通过<transactionManager type>配置事务的处理策略。

![image-20231217124001229](Mybatis%E5%9F%BA%E7%A1%80.assets/image-20231217124001229.png)

处理策略包括：

- JDBC 

这个配置直接简单使用了 JDBC 的提交和回滚设置。它依赖于从数据源得到的连接来管理事务范围。 

- MANAGED 

这个配置几乎没做什么，mybatis本身并不做事务的处理,交给其他框架去处理事务,如spring。

> 注意：如果我们使用MyBatis构建本地程序，即不是WEB程序，若将type设置成"MANAGED"，那么，我们执行的任何update操作，即使我们最后执行了commit操作，数据也不会保留，不会对数据库造成任何影响。因为我们将MyBatis配置成了“MANAGED”，即MyBatis自己不管理事务，而我们又是运行的本地程序，没有事务管理功能，所以对数据库的update操作都是无效的。

#### 引入外部配置文件

```xml
 <properties resource="jdbc.properties"></properties>
```

### 基本使用

基本使用均基于代理模式，原始SQLSession的方式并不推荐使用。

#### 参数传递

##### 单个基本数据类型

单个基本数据类型作为方法参数，#{}中可以随便写,遵循见名知意

```xml
<select id="findByEmpno" resultType="emp" >
        select * from emp where empno =#{empno}
    </select>

```

##### 多个基本数据类型

- 方式1：arg参数，当多个参数未指定集合类型时，默认组成一个LIst传递，可以使用arg参数传递 

注意的是，在Mybatis3.4.2之后，用#{arg0}、#{arg1}、…表示参数1、参数2...；在Mybatis3.4.2之前，用#{0}、#{1}、…表示参数1、参数2...

```xml
<select id="getUserByIdAndName" parameterType="Map" resultType="com.model.User">
	select * from user where id = #{arg0} and name=#{arg1}
</select>

```

- 方式2：param参数，用#{param1}、#{param2}、…表示参数1、参数2

```xml
<select id="getUserByIdAndName" parameterType="Map" resultType="com.model.User">
	select * from user where id = #{param1} and name=#{param2}
</select>
```

- 方式3：使用@Param注解，在Dao层函数的参数前面添加@Param注解来显式指定每个参数的名称

```xml
// Dao层函数
public User getUserByIdAndName(@Param("id") int id, @Param("name") String name);

<!-- 对应的Mapper中 -->
<select id="getUserByIdAndName" resultType="User">
  SELECT * FROM user WHERE id = #{id} AND name = #{name}
</select>

```

##### 单个引用数据类型

单个引用类型,{}中写的使用对象的属性名

```xml
 <select id="findByDeptnoAndSal3" resultType="emp" parameterType="emp" >
        select * from emp where deptno =#{deptno} and sal >= #{sal}
    </select>
```

##### map集合数据类型

 参数是map,#{}写键的名字

```xml
<select id="findByDeptnoAndSal2" resultType="emp" parameterType="map" >
         select * from emp where deptno =#{deptno} and sal >= #{sal}
    </select>
```

##### 多个引用数据类型

和传递多个基本数据类型一致，只不过{}中写的使用对象的属性名。

```xml
select * from emp where deptno =#{arg0.deptno} and sal >= #{arg1.sal}
select * from emp where deptno =#{param1.deptno} and sal >= #{param2.sal}
select * from emp where deptno =#{empa.deptno} and sal >= #{empb.sal}
```

注意的是，如果在DAO接口层用@Param定义了别名,那么就不能使用arg\*.属性名,但是可以使用param\*.属性名和别名.属性名。

![image-20231217132950392](Mybatis%E5%9F%BA%E7%A1%80.assets/image-20231217132950392.png)

#### 模糊查询concat

- 方法1，传参时手动添加"%"通配符

```xml
<!--模糊查询-->
<select id="fuzzyQuery" resultType="com.bin.pojo.Book">
    select * from mybatis.book where bookName like #{info};
</select>

List<Book> books = mapper.fuzzyQuery("%萨%");
```

需要手动添加"%"通配符，显然这种方式很麻烦，并且如果忘记添加通配符的话就会变成普通的查询语句，匹配全部字符查询

- 方法2：在xml中添加添加"%"通配符

```xml
<select id="fuzzyQuery" resultType="com.bin.pojo.Book">
    select * from mybatis.book where bookName like '%${info}%';
</select>

```

在mapper.xml配置文件中添加"%"通配符，但是需要用单引号将其包裹住，但是用单引号裹住之后#{}就无法被识别，要改成${}这种拼接字符串的形式。

虽然通过方式二优化了方式一的缺点，但同时也造成了SQL安全性的问题，也就是用户可以进行SQL注入。

- 方法3：借助concat()函数

在进行模糊查询时，在映射文件中可以使用concat()函数来连接参数和通配符。

另外注意对于特殊字符，比如<，不能直接书写，应该使用字符实体替换。

```xml
<select id="findByEname"  resultType="emp" >
    select * from emp where ename like concat('%',#{name},'%')
</select>

---->select * from emp where ename like "%zhang%"
```

#### 主键自增

- 方式1：<insert useGeneratedKeys>标签

useGeneratedKeys：表示要使用自增的主键

keyProperty：表示把自增的主键赋给JavaBean的哪个成员变量。

```xml
 <insert id="addDept" parameterType="dept" useGeneratedKeys="true" keyProperty="deptno">
        insert into dept values(null,#{dname},#{loc})
    </insert>
```

以添加Dept对象为例，添加前Dept对象的deptno是空的，添加完毕后可以通过getDeptno() 获取自增的主键。

- 方式2：<select key>标签

order：取值AFTER|BEFORE，表示在新增之后|之前执行<selectKey>中的SQL命令

keyProperty：执行select @@identity后结果填充到哪个属性中

resultType：结果类型。

```xml
<insert id="addDept2" parameterType="dept">
        <selectKey order="AFTER" keyProperty="deptno"  resultType="int">
            select @@identity
        </selectKey>
        insert into dept values(null,#{dname},#{loc})
    </insert>

```

> select @@identity的意思，查询后通过select @@identity获取最新生成主键。要求这条SQL必须在insert操作之后，且数据库连接没有关闭。

#### 动态SQL 

##### if

用于处理动态查询条件。

```xml
 <select id="findByCondition" resultType="emp">
        select * from emp where 1=1
        <if test="empno != null">
            and empno =#{empno}
        </if>
        <if test="ename != null and ename != ''">
            and ename like concat('%',#{ename},'%')
        </if>
</select>
```

##### where

用于处理where关键字，当使用<where>标签时，不再需要where 1=1 这种处理了。

```xml
select * from emp
    <where>
        <if test="empno != null">
            and empno= #{empno}
        </if>
        <if test="ename != null and ename != ''">
            and ename= #{ename}
        </if>
    </where>
```

##### choose

和if的不同在于：

- 前面的when条件成立  后面的  when就不再判断了
- if依然会判断

```xml
<select id="findEmpByCondition2" resultType="emp">
    select * from emp
    <where>
        <choose>
            <when test="empno != null">
                and empno= #{empno}
            </when>
            <when test="ename != null and ename != ''">
                and ename= #{ename}
            </when>
      </choose>
  </where>
</select>
```

##### set

用于动态赋值。

```xml
<update id="updateEmpByCondtion" >
    update emp
    <set>
        <if test="ename != null and ename != '' ">
            , ename =#{ename}
        </if>
        <if test="job != null and ename != '' ">
            , job =#{job}
        </if>
        <if test="mgr != null ">
            , mgr =#{mgr}
        </if>
  </set>
</update>
```

##### trim

trim 是更灵活用来去处多余关键字的标签，它可以用来实现 where 和 set 的效果。

`trim` 标签的主要功能是添加或移除前缀和后缀，以及在生成的SQL语句的前后添加需要的修饰。具体来说，`trim` 标签有以下4个属性：

- prefix（前缀）: 在内部子元素构建的语句前添加的语句。
- prefixOverrides（要覆盖的前缀）: 在生成的子句前去掉的内容。
- suffix（后缀）: 在内部子元素构建的语句后添加的语句。
- suffixOverrides（要覆盖的后缀）: 在生成的子句后去掉的内容。

例如：

对应的xml

```xml
<!--普通版-->
<update id="updateUser">
	update user_tab
	set last_name=#{lastName},age=#{age},phone=#{phone}
	where id=#{id}
</update>
```

使用suffix，并加上条件判断

```xml
<update id="updateUser">
	<trim suffix="where id=#{id}">
		update user_tab
		set
		<if test="lastName != null">
			last_name=#{lastName},
		</if>
		<if test="age != null">
			age=#{age},
		</if>
		<if test="phone != null">
			phone=#{phone}
		</if> 
	</trim>
</update>
```

相当于

![在这里插入图片描述](Mybatis%E5%9F%BA%E7%A1%80.assets/20181211223143532.png)

但如果最后一个条件未false，那么语句就会变成

![在这里插入图片描述](Mybatis%E5%9F%BA%E7%A1%80.assets/20181211223736266.png)

因此还需要使用suffixOverrides去掉最后一个`,`

```xml
<update id="updateUser">
	<trim suffix="where id=#{id}" suffixOverrides=",">
		update user_tab
		set
		<if test="lastName != null">
			last_name=#{lastName},
		</if>
		<if test="age != null">
			age=#{age},
		</if>
		<if test="phone != null">
			phone=#{phone}
		</if> 
	</trim>
</update>
```

![在这里插入图片描述](Mybatis%E5%9F%BA%E7%A1%80.assets/20181211224104682.png)

##### bind

bind标签可以使用创建一个变量并将其绑定到上下文中。

bind标签有两个属性：

- name为绑定到上下文的变量名
- value为表达式

创建一个bind标签后，就可以在下面直接使用了。 使用bind拼接字符串不仅可以避免因更换数据库而修改SQL，也能预防SQL注入。

非常常见的应用场景是模糊查询的模板。

```xml
 <select id="listProduct" resultType="Product">
            <bind name="likename" value="'%' + name + '%'" />
            select * from   product_  where name like #{likename}
 </select>
```

##### sql

 使用`sql`来封装查询的全部字段, 然后通过`include`来引入

```xml
<sql id="empColumn">empno,ename,job,mgr,hiredate,sal,comm,deptno</sql>
<select id="findByCondition" resultType="emp">
    <include refid="baseSelect"></include>
</select>
```

##### foreach

循环，包括的属性有：

- collection：遍历的集合或者是数组，参数是数组,collection中名字指定为array；参数是List集合,collection中名字指定为list
-  separator：多个元素取出的时候 用什么文字分隔
-  open：以什么开头
-  close：以什么结尾

- item：中间变量名

```xml
 <select id="findByEmpnos1" resultType="emp">
     select * from emp  where empno in
     <foreach collection="array" separator="," open="(" close=")" item="deptno">
         #{deptno}
     </foreach>
 </select>
```

### 其他

#### 逆向工程

##### 配置文件

```xml
 <dependency>
        <groupId>org.mybatis.generator</groupId>
        <artifactId>mybatis-generator-core</artifactId>
        <version>1.3.2</version>
    </dependency>
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration
  PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
  "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">

<generatorConfiguration>
   <context id="testTables" targetRuntime="MyBatis3">
      <commentGenerator>
         <!-- 是否去除自动生成的注释 true：是 ： false:否 -->
         <property name="suppressAllComments" value="true" />
      </commentGenerator>
      <!--数据库连接的信息：驱动类、连接地址、用户名、密码 -->
      <!-- <jdbcConnection driverClass="com.mysql.jdbc.Driver"
         connectionURL="jdbc:mysql://localhost:3306/mybatis" userId="root"
         password="123">
      </jdbcConnection> -->
       <jdbcConnection driverClass="com.mysql.cj.jdbc.Driver"
         connectionURL="jdbc:mysql://127.0.0.1:3306/mydb?useSSL=false&amp;useUnicode=true&amp;characterEncoding=UTF-8&amp;serverTimezone=Asia/Shanghai&amp;allowPublicKeyRetrieval=true"
         userId="root"
         password="root">
      </jdbcConnection> 

      <!-- 默认false，把JDBC DECIMAL 和 NUMERIC 类型解析为 Integer，为 true时把JDBC DECIMAL 和 
         NUMERIC 类型解析为java.math.BigDecimal -->
      <javaTypeResolver>
         <property name="forceBigDecimals" value="false" />
      </javaTypeResolver>

      <!-- targetProject:生成PO类的位置 -->
      <javaModelGenerator targetPackage="com.msb.pojo"
         targetProject=".\src">
         <!-- enableSubPackages:是否让schema作为包的后缀 -->
         <property name="enableSubPackages" value="false" />
         <!-- 从数据库返回的值被清理前后的空格 -->
         <property name="trimStrings" value="true" />
      </javaModelGenerator>
        <!-- targetProject:mapper映射文件生成的位置 -->
      <sqlMapGenerator targetPackage="com.msb.mapper"
         targetProject=".\src">
         <!-- enableSubPackages:是否让schema作为包的后缀 -->
         <property name="enableSubPackages" value="false" />
      </sqlMapGenerator>
      <!-- targetPackage：mapper接口生成的位置 -->
      <javaClientGenerator type="XMLMAPPER"
         targetPackage="com.msb.mapper"
         targetProject=".\src">
         <!-- enableSubPackages:是否让schema作为包的后缀 -->
         <property name="enableSubPackages" value="false" />
      </javaClientGenerator>
      <!-- 指定数据库表 -->
      
      <table tableName="dept" domainObjectName="Dept"
       enableCountByExample="false" enableUpdateByExample="false" enableDeleteByExample="false"    
               enableSelectByExample="false" selectByExampleQueryId="false" >
               <columnOverride column="id" javaType="Integer" />
         </table>
      
   </context>
</generatorConfiguration>

```

##### 运行

```java
public class GeneratorSqlmap {
    public void generator() throws Exception{
        List<String> warnings = new ArrayList<String>();
        boolean overwrite = true;
        File configFile = new File("generatorConfig.xml");
        ConfigurationParser cp = new ConfigurationParser(warnings);
        Configuration config = cp.parseConfiguration(configFile);
        DefaultShellCallback callback = new DefaultShellCallback(overwrite);
        MyBatisGenerator myBatisGenerator = new MyBatisGenerator(config,
                callback, warnings);
        myBatisGenerator.generate(null);

    }
    public static void main(String[] args) throws Exception {
        try {
            GeneratorSqlmap generatorSqlmap = new GeneratorSqlmap();
            generatorSqlmap.generator();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

#### 别名处理

##### 情况1：为某个类的全限定名别名

这种情况的场景在于，某个类引用次数很多，每次都要引入这个类的全限定名，比较麻烦，因此为这个类的全限定名起个简单的别名。

注意的是，正常情况下不推荐使用该别名处理器，因为使用了别明处理器不方便直接观察到所对应的类，在项目维护起来不方便。

typeAliases别名处理器：是为 Java 类型设置一个短的名字，可以方便我们 引用某个类。

- 对单个类起别名

在mybatis配置文件中进行如下配置

```xml
	<!-- 3、typeAliases：别名处理器：可以为我们的java类型起别名
			别名不区分大小写-->
<typeAliases>
		<!-- 1、typeAlias:为某个java类型起别名
type:指定要起别名的类型全类名;默认别名就是类名小写；employee
alias:指定新的别名-->
<typeAlias type="com.atguigu.mybatis.bean.Employee" alias="emp"/> 
</typeAliases>
```

在映射文件中可如下使用：

```cobol
 	<select id="getEmpById" resultType="emp">
select * from tbl_employee where id = #{id}
</select>
```

如果不使用typeAliases别名处理器则映射文件该这么配置：

```cobol
 	<select id="getEmpById" resultType="com.atguigu.mybatis.bean.Employee">
select * from tbl_employee where id = #{id}
</select>
```

 注意的是，alias属性可以不写，默认别名就是类名小写。

- 对一个包下面所有类批量别名

使用<package>标签

```xml
<typeAliases>
    <!--
    通过包扫描给所有的实体类起别名
    给指定报名下的所有类起别名
    默认每个实体类的别名是首字母小写的类名
    Dept   dept
    Emp    emp
    -->
    <package name="com.msb.pojo"/>
</typeAliases>

```

- 如果对一个类进行单独的别名命名同时又对这个类所在包进行了批量命名--->会报错

解决办法：可以在这个类中添加注释`@Alias`，起一个新的别名。

给这个类起了一个新别名emp

![image-20231217125901941](Mybatis%E5%9F%BA%E7%A1%80.assets/image-20231217125901941.png)



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

### 代理机制 //todo

> 代理机制解决的问题是，为什么我们只定义了一个mapper的Interface接口，并没有具体的实现类，却可以正常运行？

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

### 懒加载机制(多表查询)

懒加载机制的应用场景在于级联查询。

有A、B两个对象，在A对象中引用了B对象。Java层面上，通俗来说就是通过A对象的getter方法可以拿到B对象的引用。数据库层面，其实就是两表的关联查询。

#### 多表查询方式

> [!note]在Mybatis中，多表查询可以分为关联查询和级联查询。
>
> - 多表关联是指两个表通过主外键在一条SQL中完成所有数据的提取，即在一个SQL中使用JOIN关联多个表。
>
> - 多表级联查询是指通过一个对象获取与他关联的另外一个对象，执行SQL语句是多条，级联查询使用select标签，使用多个SQL语句分步查询，实体 Bean 赋值。

使用表间的关联查询，有几种方式：

- 使用JOIN连表查询SQL，resultMap组合映射关系
- 使用JOIN连表查询SQL，使用级联标签和javaType属性
- 使用级联映射的select标签，分步查询，通过两次或多次查询，为一对一关系的实体 Bean 赋值。

本节重点关注第三种，级联映射。

##### 关联查询

在关联查询中，SQL即为使用JOIN关联的一条SQL，对结果集合的映射可分为：

- 自定义ResultMap
- 根据一对一/一对多映射ResultMap

###### 自定义ResultMap

写一条sql语句，比较直接。

```sql
    <select id="getEmployeeWithDeptById0" resultMap="employeeDept0">
        select e.id id, e.name name, e.gender gender, e.email email, e.d_id departmentId, d.department_name departmentName
        from tbl_employee e, tbl_department d
        where d.id=e.d_id and e.id=#{id}
    </select>
```

在ResultMap中组合A.B映射关系，写法比较直接：

    <!-- 第一种：利用resultMap进行级联查询，不使用association标签-->
    <resultMap id="employeeDept0" type="com.hly.entity.Employee">
        <id column="id" property="id"></id>
        <result column="name" property="name"></result>
        <result column="gender" property="gender"></result>
        <result column="email" property="email"></result>
        <result column="departmentId" property="department.id"></result>
        <result column="departmentName" property="department.departmentName"></result>
    </resultMap>
###### 使用映射标签映射ResultMap

这种方法个人感觉跟第一种没有本质上的区别，还是一条sql语句对两张表进行关联查询，只不过在结果集映射的时候有一些不同，引入了association等映射标签。

可读性比较好，对象的结构关系相较于第一种方式来说更为清晰和明朗。

sql部分，与第一种无异：

```csharp
    <select id="getEmployeeWithDeptById" resultMap="employeeDept">
        select e.id id, e.name name, e.gender gender, e.email email, e.d_id departmentId, d.department_name departmentName
        from tbl_employee e, tbl_department d
        where d.id=e.d_id and e.id=#{id}
    </select>
```

resultMap在进行结果映射时，有一定的区别：

```xml
    <!-- 第二种：利用resultMap进行关联查询，使用association标签 -->
    <resultMap id="employeeDept" type="com.hly.entity.Employee">
        <id column="id" property="id"></id>
        <result column="name" property="name"></result>
        <result column="gender" property="gender"></result>
        <result column="email" property="email"></result>
        <association property="department" javaType="com.hly.entity.Department">
            <id column="departmentId" property="id"></id>
            <result column="departmentName" property="departmentName"></result>
        </association>
    </resultMap>
```

可以看到在这种写法中，通过association标签明确指定了department对象的类型，然后在这个association的子标签中对department对象进行结果映射。

当然，其他形式的映射可以参照下面的关系映射标签。

> [!Attention]可以这么理解associaiton等标签，它们的作用有两方面
>
> 1、映射ResultMap
>
> 2、子标签select实现级联查询
>
> 无论是所谓的关联查询还是级联查询，都可以使用这些标签映射ResultMap。这些标签并不是某个确定的查询才能使用的标签，而是根据标签的用法确定是哪种技术路线：关联查询/级联查询。

##### 级联查询(select标签)

与前面写法有比较大的不同，使用association的select标签，可以将原本两表联查的一条sql语句拆分为两条简单的sql语句。

> [!Note]个人以为搞出这种方式的原因就是要支持级联查询的懒加载，这样可以很好的提升数据库的性能，毕竟只有在用到关联对象相关属性的时候，才会执行第二步的查询操作。

sql部分，这里就分两部分了：

- 第一是在tbl_employee表中，根据id查出对应的记录。
- 第二步就是根据前一步中查出的d_id的值，在tbl_department中查询对应的记录。

<font color=red>**注意这两个sql是分散在两个mapper.xml中的，分别是各自Pojo对应的Mapper方法**</font>

```sql
    <select id="getEmployeeWithDeptById0" resultMap="employeeDept0">
        select e.id id, e.name name, e.gender gender, e.email email, e.d_id departmentId, d.department_name departmentName
        from tbl_employee e, tbl_department d
        where d.id=e.d_id and e.id=#{id}
    </select>
```

```sql
    <select id="getDeptById" resultType="com.hly.entity.Department">
        SELECT id id, department_name departmentName FROM tbl_department where id=#{id}
    </select>
```

在结果集映射中，级联标签标签中有两个重要的属性，<font color=red>select是用来指定这个对象怎么去查，而column属性则是从第一步的查询结果中找出select所需的查询参数</font>。

```xml
    <!-- 第三种：利用select标签进行分步查询 -->
    <resultMap id="employeeByStep" type="com.hly.entity.Employee">
        <id column="id" property="id"></id>
        <result column="name" property="name"></result>
        <result column="gender" property="gender"></result>
        <result column="email" property="email"></result>
        <association property="department" select="com.hly.dao.DepartmentMapper.getDeptById" column="d_id">
            <id column="id" property="id"></id>
            <result column="department_name" property="departmentName"></result>
        </association>
    </resultMap>
```

#### 关系映射标签

1. association表示的是has one的关系，一对一或者多对一时使用，生成的某个实体类对象；
2. collection表示的是has many的关系，一对多或者多对多时使用，生成的是一个集合；

##### 一对一/多对一

使用<association>标签。

```xml
<resultMap id="empMap" type="com.mybatis.bean.Employee">
        <id column="emp_id" property="empId"></id>
        <result column="emp_name" property="empName"></result>
        <!--association映射员工表里的部门属性Department dept-->
        <association column="d_id"
        			 property="dept"
        			 javaType="com.mybatis.bean.Department" 
        			 select="com.mybatis.mapper.DepartmentMapper.getDept">
        <!--select属性指定连接查询的方法地址-->
        </association>
</resultMap>
```

在 <association> 元素中通常使用以下属性。

- property：指定映射到实体类的对象属性。
- column：指定表中对应的字段（即查询返回的列名）。
- javaType：指定映射到实体对象属性的类型。
- select：指定引入嵌套查询的子 SQL 语句，该属性用于关联映射中的嵌套查询。

##### 一对多

```xml
<!--映射关系，column表示数据库字段，property表示JavaBean字段-->
<resultMap id="deptMap" type="com.mybatis.bean.Department">
    <id column="dept_id" property="deptId"></id>
    <result column="dept_name" property="deptName"></result>
    <!--映射外部对象属性：private List<Employee> emps-->
    <collection property="emps" column="dept_id" 
                javaType="java.util.ArrayList"
                ofType="com.mybatis.bean.Employee" 
                select="com.mybatis.mapper.EmployeeMapper.getEmpsByDeptId">
                <!--通过select标签引入外部查询方法-->
    </collection>
</resultMap>
```

在 <collection> 元素中通常使用以下属性。

- property：指定映射到实体类的对象属性
- column：指定表中对应的字段（即查询返回的列名）
- select：指定引入嵌套查询的子 SQL 语句，该属性用于关联映射中的嵌套查询
- ofType：指定的是映射到list集合属性中pojo的类型 
- javaType：指定映射到实体对象属性的类型，均为LIst类型，默认可不写

##### 多对多

特别说明一下，多对多关系，MyBatis 没有实现多对多级联，推荐通过两个一对多级联替换多对多级联，以降低关系的复杂度。

> 同时在数据库设计中，一般也会对多对多关系进行改进，专门建立一个中间表对实体类的关联关系进行描述，转换成两个一对多关系，这样也满足第三范式，Mybatis中也是如此。

例如，一个用户可以在多个群组，一个群组可以有多个用户，实现“查询所有群组以及群组下每个用户信息”的功能。

- 额外建立一个关联对象中间实体类。此时，用户和中间表是

  ```java
  /** 
       * @describe: 描述User和Group之间的映射关系 
       */  
      public class UserGroupLink {  
  
          private User user;  
  
          private Group group;  
  
          private Date createTime;  
  
          public Date getCreateTime() {  
              return createTime;  
          }  
  
          public void setCreateTime(Date createTime) {  
              this.createTime = createTime;  
          }  
  
          public Group getGroup() {  
              return group;  
          }  
  
          public void setGroup(Group group) {  
              this.group = group;  
          }  
  
          public User getUser() {  
              return user;  
          }  
  
          public void setUser(User user) {  
              this.user = user;  
          }  
      }  
  ```

- ResultMap

  ```xml
   <resultMap type="Group" id="groupUserMap" extends="groupMap">  
              <collection property="users" ofType="User">  
                  <id property="id" column="userId" />  
                  <result property="name" column="userName" />  
                  <result property="password" column="password" />  
                  <result property="createTime" column="userCreateTime" />  
              </collection>  
          </resultMap>  
  ```

#### 延迟规则

##### 三种延迟策略

MyBatis根据对关联对象查询的select语句的执行时机，分为三种类型：直接加载、侵入式延迟加载与深度延迟加载。

- 直接加载：执行完对主加载对象的 select 语句，马上执行对关联对象的 select 查询。
- 侵入式延迟： 执行对主加载对象的查询时，不会执行对关联对象的查询。但当要访问主加载对象的详情属性时，就会马上执行关联对象的select查询。
- 深度延迟： 执行对主加载对象的查询时，不会执行对关联对象的查询。访问主加载对象的详情时也不会执行关联对象的select查询。只有当真正访问关联对象的详情时，才会执行对关联对象的 select 查询。

#####  配置全局延迟加载

```xml
	<!-- 在Mybatis的核⼼配置⽂件中可以使⽤setting标签修改全局的加载策略-->
	<settings>
		<!-- 打开延迟加载的开关 -->
		<setting name="lazyLoadingEnabled" value="true"/>
		<!--不是必要的标签   false 深入式延迟加载   true 侵入式延迟加载 -->
	 	<setting name="aggressiveLazyLoading" value="false"/>
	</settings>

```

选项lazyLoadingEnabled决定是否开启延迟加载，而选项aggressiveLazyLoading则控制是否采用层级加载：

- lazyLoadingEnabled：延迟加载全局开关。当开启时，所有关联对象都会延迟加载。在特定关系中，可通过设置fetchType属性来覆盖该项的开关状态。默认值：true。
- aggressiveLazyLoading：当开启时，对任意属性的调用会使带有延迟加载属性的对象完整加载；反之，则每种属性按需加载。默认：false，也就是深入式延迟加载，当为true时即为侵入式延迟加载。

侵入式延迟加载和深入式延迟加载的区别：

例如，class 与 student 之间是一对多关系，在加载时，可以先加载 class 数据，当需要使用到 student 数据时，再加载 student 的相关数据。

- 侵入式延迟加载
  侵入式延迟加载指的是只要主表的任一属性加载，就会触发延迟加载，比如：class 的 name 被加载，student 信息就会被触发加载。

- 深度延迟加载
  深度延迟加载指的是只有关联的从表信息被加载，延迟加载才会被触发。

通常，我们在实战中更倾向使用深度延迟加载。

##### 配置局部延迟

在具体的Mapper.xml中配置fetchType延迟策略

```xml
<!--修改标签的fetchType属性 fetchType="lazy" 延迟加载策略 fetchType="eager" ⽴即加载策略-->
<resultMap id="kunkunMap" type="user">
    <id column="id" property="id"></id>
    <result column="ctrl" property="ctrl"></result>
    
    <!--开启⼀对多 延迟加载-->
    <collection property="userList" ofType="order" column="id"
        select="com.lagou.dao.OrderMapper.findByUid" fetchType="lazy">
    </collection>
    
    <!--开启⼀对一 延迟加载-->
	<association property="order" column="id" javaType="order"
        select="com.xinxin.dao.OrderMapper.findById" fetchType="lazy">
    </association>
</resultMap>
```

在`association`和`collection`标签中都有一个`fetchType`属性，通过修改它的值，可以修改局部的加载策略，fetchType的取值包括：

- "lazy" 懒加载策略 
- "eager" ⽴即加载策略

这样的话，该语句会覆盖全局配置的lazyLoadingEnabled属性，适用的场景是在全局配置加载策略后，想针对某个语句进行配置，局部配置将覆盖全局配置。

#### 懒加载原理

> 它的原理是，使用 CGLIB 或 Javassist( 默认 ) 创建目标对象的代理对象。当调用代理对象的延迟加载属性的 getting 方法时，进入拦截器方法。比如调用 a.getB().getName() 方法，进入拦截器的 invoke(...) 方法，发现 a.getB() 需要延迟加载时，那么就会单独发送事先保存好的查询关联 B 对象的 SQL ，把 B 查询上来，然后调用 a.setB(b) 方法，于是 a 对象 b 属性就有值了，接着完成 a.getB().getName() 方法的调用。这就是延迟加载的基本原理。

##### 代理对象生成

Mybatis的查询结果是由ResultSetHandler接口的handleResultSets()方法处理的。ResultSetHandler接口只有一个实现，DefaultResultSetHandler，接下来看下延迟加载相关的一个核心的方法createResultObject()。

```java
private Object createResultObject(ResultSetWrapper rsw, ResultMap resultMap, ResultLoaderMap lazyLoader, String columnPrefix) throws SQLException {
        this.useConstructorMappings = false;
        List<Class<?>> constructorArgTypes = new ArrayList();
        List<Object> constructorArgs = new ArrayList();
        // 获取返回值结果真实对象
        Object resultObject = this.createResultObject(rsw, resultMap, constructorArgTypes, constructorArgs, columnPrefix);
        // 返回值不等于null且返回值类型指定了resultMap标签
        if (resultObject != null && !this.hasTypeHandlerForResultObject(rsw, resultMap.getType())) {
        // 对于resultMap标签里的全部子标签如：id，result，association，collection
            List<ResultMapping> propertyMappings = resultMap.getPropertyResultMappings();
            Iterator var9 = propertyMappings.iterator();

            while(var9.hasNext()) {
                ResultMapping propertyMapping = (ResultMapping)var9.next();
                //判断属性有没配置嵌套查询（association，collection中的select属性指定了StatemenId），且备注懒加载，如果有就创建代理对象
                if (propertyMapping.getNestedQueryId() != null && propertyMapping.isLazy()) {
                // 获取代理对象
                    resultObject = this.configuration.getProxyFactory().createProxy(resultObject, lazyLoader, this.configuration, this.objectFactory, constructorArgTypes, constructorArgs);
                    break;
                }
            }
        }

        this.useConstructorMappings = resultObject != null && !constructorArgTypes.isEmpty();
        return resultObject;
    }
```

- 进入configuration.getProxyFactory()

```java
// 默认为Javassist代理工厂
private proxyFactory = new JavassistProxyFactory();
public ProxyFactory getProxyFactory() {
        return this.proxyFactory;
    }
```

- 进入JavassistProxyFactory的createProxy()方法发现底层调用的是JavassistProxyFactory的静态内部类EnhancedResultObjectProxyImpl的createProxy()方法

```java
public static Object createProxy(Object target, ResultLoaderMap lazyLoader, Configuration configuration, ObjectFactory objectFactory, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
      // 结果集的对象类型
            Class<?> type = target.getClass();
            // 类似JDK动态代理InvocationHandler接口的实现类一样，要实现invoke方法
            JavassistProxyFactory.EnhancedResultObjectProxyImpl callback = new JavassistProxyFactory.EnhancedResultObjectProxyImpl(type, lazyLoader, configuration, objectFactory, constructorArgTypes, constructorArgs);
            // 调用JavassistProxyFactory的静态方法获取代理对象
            Object enhanced = JavassistProxyFactory.crateProxy(type, callback, constructorArgTypes, constructorArgs);
            PropertyCopier.copyBeanProperties(type, target, enhanced);
            return enhanced;
        }
```

- 进入JavassistProxyFactory的静态crateProxy方法

```java
static Object crateProxy(Class<?> type, MethodHandler callback, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
        org.apache.ibatis.javassist.util.proxy.ProxyFactory enhancer = new org.apache.ibatis.javassist.util.proxy.ProxyFactory();
        enhancer.setSuperclass(type);

        try {
            type.getDeclaredMethod("writeReplace");
            if (log.isDebugEnabled()) {
                log.debug("writeReplace method was found on bean " + type + ", make sure it returns this");
            }
        } catch (NoSuchMethodException var10) {
            enhancer.setInterfaces(new Class[]{WriteReplaceInterface.class});
        } catch (SecurityException var11) {
        }

        Class<?>[] typesArray = (Class[])constructorArgTypes.toArray(new Class[constructorArgTypes.size()]);
        Object[] valuesArray = constructorArgs.toArray(new Object[constructorArgs.size()]);

        Object enhanced;
        try {
        // 创建代理类
            enhanced = enhancer.create(typesArray, valuesArray);
        } catch (Exception var9) {
            throw new ExecutorException("Error creating lazy proxy.  Cause: " + var9, var9);
        }
    // 为代理类绑定处理执行器
        ((Proxy)enhanced).setHandler(callback);
        return enhanced;
    }
```

总结：当返回结果集有配置嵌套查询（association，collection中的select属性指定了StatemenId），且备注懒加载，如果有就基于Javassis产生的代理类

##### 代理对象调用懒加载属性的加载原理

- 懒加载代理对象执行方法是实际执行的是代理对象执行器EnhancedResultObjectProxyImpl的invoke方法

```java
public Object invoke(Object enhanced, Method method, Method methodProxy, Object[] args) throws Throwable {
            String methodName = method.getName();

            try {
                synchronized(this.lazyLoader) {
                    if ("writeReplace".equals(methodName)) {
                        Object original;
                        if (this.constructorArgTypes.isEmpty()) {
                            original = this.objectFactory.create(this.type);
                        } else {
                            original = this.objectFactory.create(this.type, this.constructorArgTypes, this.constructorArgs);
                        }

                        PropertyCopier.copyBeanProperties(this.type, enhanced, original);
                        if (this.lazyLoader.size() > 0) {
                            return new JavassistSerialStateHolder(original, this.lazyLoader.getProperties(), this.objectFactory, this.constructorArgTypes, this.constructorArgs);
                        }

                        return original;
                    }
        //延迟加载数量大于0
                    if (this.lazyLoader.size() > 0 && !"finalize".equals(methodName)) {
                    //aggressive 一次加载性所有需要要延迟加载属性或者包含触发延迟加载方法  
                    //对于延迟加载的两个可配置属性，一个为是否一个方法执行全部属性都加载，第二个为指定方法运行是进行全部延时加载（默认指定方法包括hashCode，toString等）
                        if (!this.aggressive && !this.lazyLoadTriggerMethods.contains(methodName)) {
                            String property;
                            // 是否为set方法
                            if (PropertyNamer.isSetter(methodName)) {
                                property = PropertyNamer.methodToProperty(methodName);
                                this.lazyLoader.remove(property);
                                // 是否为get方法
                            } else if (PropertyNamer.isGetter(methodName)) {
                                property = PropertyNamer.methodToProperty(methodName);
                                // 该属性是否设置懒加载
                                if (this.lazyLoader.hasLoader(property)) {
                                // 执行预先缓存好的sql查询，加载当前属性 ，查询后调用set方法为该属性赋值
                                    this.lazyLoader.load(property);
                                }
                            }
                        } else {
                        // 执行sql查询，加载全部属性
                            this.lazyLoader.loadAll();
                        }
                    }
                }
        // 继续执行原方法
                return methodProxy.invoke(enhanced, args);
            } catch (Throwable var10) {
                throw ExceptionUtil.unwrapThrowable(var10);
            }
        }
```

总结：懒加载代理对象执行方法是会被代理对象的拦截处理器监听执行invoke方法，在invoke方法中会判断改属性是否需要延迟加载以及是否会导致全部属性延迟加载，如果会就执行事先储存好的查询sql并调用set方法为该懒加载对象的属性赋值，并继续执行原方法。

#### 其他

##### resultMap属性

| **属性**        | **描述**                                                     |
| --------------- | ------------------------------------------------------------ |
| **property**    | 需要映射到JavaBean 的属性名称。                              |
| **javaType**    | property的类型，一个完整的类名，或者是一个类型别名。如果你匹配的是一个JavaBean，那MyBatis 通常会自行检测到。 |
| **column**      | 数据表的列名或者列别名。                                     |
| **jdbcType**    | column在数据库表中的类型。这个属性只在insert,update  或delete 的时候针对允许空的列有用。JDBC 需要这项，但MyBatis 不需要。 |
| **typeHandler** | 使用这个属性可以覆写类型处理器，实现javaType、jdbcType之间的相互转换。一般可以省略，会探测到使用的什么类型的typeHandler进行处理 |
| **fetchType**   | 自动延迟加载                                                 |
| **select**      | association、collection的属性，使用哪个查询查询属性的值，要求指定namespace+id的全名称 |
| **ofType**      | collection的属性，指明集合中元素的类型（即泛型类型）         |

#####  级联查询vs多表关联查询

|               | **级联查询**       | **多表关联查询** |
| ------------- | ------------------ | ---------------- |
| **SQL数量**   | 多条               | 一条             |
| **性能**      | 性能低             | 性能高           |
| **延迟加载**  | 立即加载、延迟加载 | 只有立即加载     |
| **灵活性**    | 更灵活             | 不灵活           |
| **SQL难易度** | 简单               | 复杂             |
| **选择依据**  | 简单、灵活         | 高性能           |

##### ResultType Vs ResutMap 

1)   如果是单表的查询并且封装的实体和数据库的字段一一对应  resultType

2)   如果实体封装的属性和数据库的字段不一致 resultMap

3)   使用N+1级联查询的时候  resultMap

4)   使用的是多表的连接查询 resultMap

##### 映射实现

**一对一关联映射的实现**

1)   实例举例：学生和学生证、雇员和工牌

2)   数据库层次：主键关联或者外键关联

3)   MyBatis层次：在映射文件的设置双方均使用association即可，用法相同 

**多对多映射的实现**

1)   实例举例：学生和课程、用户和角色

2)   数据库层次：引入一个中间表将一个多对多转为两个一对多

3)   MyBatis层次

方法1：在映射文件的设置双方均使用collection即可，不用引入中间类

方法2：引入中间类和中间类的映射文件，按照两个一对多处理

**自关联映射**

1)   实例举例：Emp表中的员工和上级，一般是一对多关联

2)   数据库层次：外键参考当前表的主键

3)   MyBatis层次：按照一对多处理，但是增加的属性都写到一个实体类中，增加的映射也都写到一个映射文件中

### 缓存机制

#### 一级缓存

一级存储是SqlSession上的缓存，默认开启，是一种内存型缓存,不要求实体类对象实现Serializable接口。

缓存中的数据使用键值对形式存储数据，value值为查询结果对象。

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/4346b4ad191f5a33028f269af4007901.png)

> [!note]
>
> 一级缓存生命周期是sqlSession的，只有在同一个sqlSession下的mapper才会经过缓存。
>
> 例如，中间发生了增删改或者是调用了SqlSession调用了commit,会自动清空缓存。

##### 配置

mybatis一级缓存的范围有SESSION和STATEMENT两种，默认是SESSION。

<font color=red>一级缓存是默认一直开启的，我们是关闭不了的。如果不想使用一级缓存，可以把一级缓存的范围指定为STATEMENT，这样每次执行完一个Mapper中的语句后都会将一级缓存清除。</font>

如果需要更改一级缓存的范围，可以在Mybatis的配置文件中，在下通过localCacheScope指定。

```
<setting name="localCacheScope" value="STATEMENT"/>
```

#####  实验

接下来通过实验，了解MyBatis一级缓存的效果，每个单元测试后都请恢复被修改的数据。

首先是创建示例表student，创建对应的POJO类和增改的方法，具体可以在entity包和mapper包中查看。

```sql
CREATE TABLE `student` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `age` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
```

在以下实验中，id为1的学生名称是凯伦。

###### 实验1

开启一级缓存，范围为会话级别，调用三次`getStudentById`，代码如下所示：

```java
public void getStudentById() throws Exception {
        SqlSession sqlSession = factory.openSession(true); // 自动提交事务
        StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
        System.out.println(studentMapper.getStudentById(1));
        System.out.println(studentMapper.getStudentById(1));
        System.out.println(studentMapper.getStudentById(1));
    }
```

执行结果：

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/9e996384.jpg)

我们可以看到，只有第一次真正查询了数据库，后续的查询使用了一级缓存。

###### 实验2

增加了对数据库的修改操作，验证在一次数据库会话中，如果对数据库发生了修改操作，一级缓存是否会失效。

```java
@Test
public void addStudent() throws Exception {
        SqlSession sqlSession = factory.openSession(true); // 自动提交事务
        StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
        System.out.println(studentMapper.getStudentById(1));
        System.out.println("增加了" + studentMapper.addStudent(buildStudent()) + "个学生");
        System.out.println(studentMapper.getStudentById(1));
        sqlSession.close();
}
```

执行结果：

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/fb6a78e0.jpg)

我们可以看到，在修改操作后执行的相同查询，查询了数据库，**一级缓存失效**。

###### 实验3

开启两个`SqlSession`，在`sqlSession1`中查询数据，使一级缓存生效，在`sqlSession2`中更新数据库，验证一级缓存只在数据库会话内部共享。

```java
@Test
public void testLocalCacheScope() throws Exception {
        SqlSession sqlSession1 = factory.openSession(true); 
        SqlSession sqlSession2 = factory.openSession(true); 

        StudentMapper studentMapper = sqlSession1.getMapper(StudentMapper.class);
        StudentMapper studentMapper2 = sqlSession2.getMapper(StudentMapper.class);

        System.out.println("studentMapper读取数据: " + studentMapper.getStudentById(1));
        System.out.println("studentMapper读取数据: " + studentMapper.getStudentById(1));
        System.out.println("studentMapper2更新了" + studentMapper2.updateStudentName("小岑",1) + "个学生的数据");
        System.out.println("studentMapper读取数据: " + studentMapper.getStudentById(1));
        System.out.println("studentMapper2读取数据: " + studentMapper2.getStudentById(1));
}
```

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/f480ac76.jpg)

`sqlSession2`更新了id为1的学生的姓名，从凯伦改为了小岑，但session1之后的查询中，id为1的学生的名字还是凯伦，出现了脏数据，也证明了之前的设想，一级缓存只在数据库会话内部共享。

#####  原理

###### 处理流程

![image-20231217203128427](Mybatis%E5%9F%BA%E7%A1%80.assets/image-20231217203128427.png)

主要步骤如下:

1. 对于某个Select Statement，根据该Statement生成key。
2. 判断在Local Cache中,该key是否用对应的数据存在。
3. 如果命中，则跳过查询数据库，继续往下走。
4. 如果没命中：
    4.1  去数据库中查询数据，得到查询结果；
    4.2  将key和查询到的结果作为key和value，放入Local Cache中。
    4.3. 将查询结果返回；
5. 判断缓存级别是否为STATEMENT级别，如果是的话，清空本地缓存。

**「当查询的时候先从缓存中查询，如果查询不到的话再从数据库中查询」**

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/486bf7f61ccf4d87ee4f0d0df7d625bd.png)

当使用同一个SqlSession执行更新操作时，会先清空一级缓存。因此一级缓存中内容被使用的概率也很低。

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/3d75dec82ec05ecaeebdcbbd3525fa72.png)

###### 存储结构

```java
// BaseExecutor
protected PerpetualCache localCache;
```

一级缓存是BaseExecutor中的一个成员变量localCache（<font color=red>对HashMap的一个简单封装</font>），因此一级缓存的生命周期与SqlSession相同。

###### cacheKey的计算

当执行sql的如下4个条件都相等时，CacheKey才会相等

1. mappedStatment的id
2. 指定查询结构集的范围
3. 查询所使用SQL语句
4. 用户传递给SQL语句的实际参数值

```java
CacheKey cacheKey = new CacheKey();
cacheKey.update(ms.getId());
cacheKey.update(rowBounds.getOffset());
cacheKey.update(rowBounds.getLimit());
cacheKey.update(boundSql.getSql());
//后面是update了sql中带的参数
cacheKey.update(value);
```

- CacheKey类的内部结构

```java
private static final int DEFAULT_MULTIPLYER = 37;
private static final int DEFAULT_HASHCODE = 17;

private int multiplier;
private int hashcode;
private long checksum;
private int count;
private List<Object> updateList;

public CacheKey() {
    this.hashcode = DEFAULT_HASHCODE;
    this.multiplier = DEFAULT_MULTIPLYER;
    this.count = 0;
    this.updateList = new ArrayList<Object>();
}
```

首先是成员变量和构造函数，有一个初始的`hachcode`和乘数，同时维护了一个内部的`updatelist`。在`CacheKey`的`update`方法中，会进行一个`hashcode`和`checksum`的计算，同时把传入的参数添加进`updatelist`中。如下代码所示：

```java
public void update(Object object) {
    int baseHashCode = object == null ? 1 : ArrayUtil.hashCode(object); 
    count++;
    checksum += baseHashCode;
    baseHashCode *= count;
    hashcode = multiplier * hashcode + baseHashCode;
    
    updateList.add(object);
}
```

cahceKey的equlas方法为：

```java
@Override
public boolean equals(Object object) {
    .............
    for (int i = 0; i < updateList.size(); i++) {
      Object thisObject = updateList.get(i);
      Object thatObject = cacheKey.updateList.get(i);
      if (!ArrayUtil.equals(thisObject, thatObject)) {
        return false;
      }
    }
    return true;
}
```

#####  一级缓存失效的情况

- 使用了不同的sqlSession查询，不同的sqlsession对应不同的一级缓存
- 同一个sqlsession但是查询的条件不同
- 同一个sqlsession两次查询期间执行了任意一次增删改操作
- 同一个sqlsession两次查询期间手动清空了缓存  `sqlSession.clearCache()`

##### 一级缓存可能造成的问题

**MyBatis的一级缓存最大范围是SqlSession内部，有多个SqlSession或者分布式的环境下，数据库写操作会引起脏数据**

即当在同一个sqlSession读取两次数据之间，有其他sqlSession对该数据进行了修改，则第二次读取会默认读取缓存，引发脏数据。

**「看到这想一想，用mybatis后没设置这个参数啊，好像也没发生脏读的问题啊，其实是因为和spring整合了」**

当mybatis和spring整合后：

1. 在未开启事务的情况之下，每次查询，spring都会关闭旧的sqlSession而创建新的sqlSession，因此此时的一级缓存是没有起作用的
2. 在开启事务的情况之下，spring使用threadLocal获取当前线程绑定的同一个sqlSession，因此此时一级缓存是有效的，当事务执行完毕，会关闭sqlSession

**「当mybatis和spring整合后，未开启事务的情况下，不会有任何问题，因为一级缓存没有生效。当开启事务的情况下，可能会有问题，由于一级缓存的存在，在事务内的查询隔离级别是可重复读，即使数据库的隔离级别设置的是提交读」**

##### 一级缓存总结

1. MyBatis一级缓存的生命周期和SqlSession一致。
2. MyBatis一级缓存内部设计简单，<font color=red>只是一个没有容量限定的HashMap</font>，在缓存的功能性上有所欠缺。
3. MyBatis的一级缓存最大范围是SqlSession内部，有多个SqlSession或者分布式的环境下，数据库写操作会引起脏数据，建议设定缓存级别为Statement。

#### 二级缓存

也叫 **全局缓存**，基于 `namespace` 的缓存，一个 `namespace` 对应一个二级缓存。

可以是由一个SqlSessionFactory创建的SqlSession之间共享缓存数据，默认并不开启。

##### 配置

1）全局开关：在sqlMapConfig.xml文件中的<settings>标签配置开启二级缓存

```
<settings>
    <setting name="cacheEnabled" value="true"/>
</settings>
```

cacheEnabled的默认值就是true，所以这步的设置可以省略。

2）分开关：在对应的 `xxxMapper.xml` 中配置二级缓存；

```
<mapper namespace="com.msb.mapper.EmployeeMapper">
    <cache/>
</mapper>
```

配置之后，`xxxMapper.xml` 文件中的 `select` 语句将会被缓存，而 `insert、update、delete` 则会刷新缓存，清空整个namespace的缓存。

cache 有一些可选的属性 type, eviction, flushInterval, size, readOnly, blocking。

```
<cache type="" readOnly="" eviction=""flushInterval=""size=""blocking=""/>
```

| **属性**      | 含义                                                         | 默认值 |
| ------------- | ------------------------------------------------------------ | ------ |
| type          | 自定义缓存类，要求实现org.apache.ibatis.cache.Cache接口      | null   |
| readOnly      | 是否只读 <br/> true:给所有调用者返回缓存对象的相同实例。因此这些对象不能被修改。这提供了很重要的性能优势。  <br/>false:会返回缓存对象的拷贝(通过序列化) 。这会慢一些,但是安全 | false  |
| eviction      | 缓存策略 <br> LRU（默认） – 最近最少使用：移除最长时间不被使用的对象。<br/> FIFO – 先进先出：按对象进入缓存的顺序来移除它们。<br/> SOFT – 软引用：基于垃圾回收器状态和软引用规则移除对象。  <br/>WEAK – 弱引用：更积极地基于垃圾收集器状态和弱引用规则移除对象。 | LRU    |
| flushInterval | 刷新间隔，毫秒为单位。默认为null，也就是没有刷新间隔，只有执行update、insert、delete语句才会刷新 | null   |
| size          | 缓存对象个数                                                 | 1024   |
| blocking      | 是否使用阻塞性缓存BlockingCache <br/> true：在查询缓存时锁住对应的Key，如果缓存命中了则会释放对应的锁，否则会在查询数据库以后再释放锁，保证只有一个线程到数据库中查找指定key对应的数据  <br/>false：不使用阻塞性缓存，性能更好 | false  |

3）二级缓存未必完全使用内存,有可能占用硬盘存储,缓存中存储的JavaBean对象必须实现序列化接口。

```
public class Emp implements  Serializable {  }
```

4）select标签的useCache属性

该属性表示查询产生的结果是否要保存的二级缓存中，useCache属性的默认值为true，这个配置可以将二级缓存细分到语句级别。

##### 实验

在本实验中，id为1的学生名称初始化为点点。

###### 实验1

测试二级缓存效果，不提交事务，`sqlSession1`查询完数据后，`sqlSession2`相同的查询是否会从缓存中获取数据。

```java
@Test
public void testCacheWithoutCommitOrClose() throws Exception {
        SqlSession sqlSession1 = factory.openSession(true); 
        SqlSession sqlSession2 = factory.openSession(true); 
        
        StudentMapper studentMapper = sqlSession1.getMapper(StudentMapper.class);
        StudentMapper studentMapper2 = sqlSession2.getMapper(StudentMapper.class);

        System.out.println("studentMapper读取数据: " + studentMapper.getStudentById(1));
        System.out.println("studentMapper2读取数据: " + studentMapper2.getStudentById(1));
}
```

执行结果：

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/71e2bfdc.jpg)

我们可以看到，当`sqlsession`没有调用`commit()`方法时，二级缓存并没有起到作用。

###### 实验2

测试二级缓存效果，当提交事务时，`sqlSession1`查询完数据后，`sqlSession2`相同的查询是否会从缓存中获取数据。

```java
@Test
public void testCacheWithCommitOrClose() throws Exception {
        SqlSession sqlSession1 = factory.openSession(true); 
        SqlSession sqlSession2 = factory.openSession(true); 
        
        StudentMapper studentMapper = sqlSession1.getMapper(StudentMapper.class);
        StudentMapper studentMapper2 = sqlSession2.getMapper(StudentMapper.class);

        System.out.println("studentMapper读取数据: " + studentMapper.getStudentById(1));
        sqlSession1.commit();
        System.out.println("studentMapper2读取数据: " + studentMapper2.getStudentById(1));
}
```

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/f366f34e.jpg)

从图上可知，`sqlsession2`的查询，使用了缓存，缓存的命中率是0.5。

###### 实验3

测试`update`操作是否会刷新该`namespace`下的二级缓存。

```java
@Test
public void testCacheWithUpdate() throws Exception {
        SqlSession sqlSession1 = factory.openSession(true); 
        SqlSession sqlSession2 = factory.openSession(true); 
        SqlSession sqlSession3 = factory.openSession(true); 
        
        StudentMapper studentMapper = sqlSession1.getMapper(StudentMapper.class);
        StudentMapper studentMapper2 = sqlSession2.getMapper(StudentMapper.class);
        StudentMapper studentMapper3 = sqlSession3.getMapper(StudentMapper.class);
        
        System.out.println("studentMapper读取数据: " + studentMapper.getStudentById(1));
        sqlSession1.commit();
        System.out.println("studentMapper2读取数据: " + studentMapper2.getStudentById(1));
        
        studentMapper3.updateStudentName("方方",1);
        sqlSession3.commit();
        System.out.println("studentMapper2读取数据: " + studentMapper2.getStudentById(1));
}
```

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/3ad93c3a.jpg)

可以看到，在`sqlSession3`更新数据库，并提交事务后，`sqlsession2`的`StudentMapper namespace`下的查询走了数据库，没有走Cache。

######  实验4

验证MyBatis的二级缓存不适应用于映射文件中存在多表查询的情况。

通常会为每个单表创建单独的映射文件，由于MyBatis的二级缓存是基于`namespace`的，多表查询语句所在的`namspace`无法感应到其他`namespace`中的语句对多表查询中涉及的表进行的修改，引发脏数据问题。

```java
@Test
public void testCacheWithDiffererntNamespace() throws Exception {
        SqlSession sqlSession1 = factory.openSession(true); 
        SqlSession sqlSession2 = factory.openSession(true); 
        SqlSession sqlSession3 = factory.openSession(true); 
    
        StudentMapper studentMapper = sqlSession1.getMapper(StudentMapper.class);
        StudentMapper studentMapper2 = sqlSession2.getMapper(StudentMapper.class);
        ClassMapper classMapper = sqlSession3.getMapper(ClassMapper.class);
        
        System.out.println("studentMapper读取数据: " + studentMapper.getStudentByIdWithClassInfo(1));
        sqlSession1.close();
        System.out.println("studentMapper2读取数据: " + studentMapper2.getStudentByIdWithClassInfo(1));

        classMapper.updateClassName("特色一班",1);
        sqlSession3.commit();
        System.out.println("studentMapper2读取数据: " + studentMapper2.getStudentByIdWithClassInfo(1));
}
```

执行结果：

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/5265ed97.jpg)

在这个实验中，我们引入了两张新的表，一张class，一张classroom。class中保存了班级的id和班级名，classroom中保存了班级id和学生id。我们在`StudentMapper`中增加了一个查询方法`getStudentByIdWithClassInfo`，用于查询学生所在的班级，涉及到多表查询。在`ClassMapper`中添加了`updateClassName`，根据班级id更新班级名的操作。

当`sqlsession1`的`studentmapper`查询数据后，二级缓存生效。保存在StudentMapper的namespace下的cache中。当`sqlSession3`的`classMapper`的`updateClassName`方法对class表进行更新时，`updateClassName`不属于`StudentMapper`的`namespace`，所以`StudentMapper`下的cache没有感应到变化，没有刷新缓存。当`StudentMapper`中同样的查询再次发起时，从缓存中读取了脏数据。

###### 实验5

为了解决实验4的问题呢，可以使用Cache ref，让`ClassMapper`引用`StudenMapper`命名空间，这样两个映射文件对应的SQL操作都使用的是同一块缓存了。

执行结果：

![img](Mybatis%E5%9F%BA%E7%A1%80.assets/a2e4c2d8.jpg)

不过这样做的后果是，缓存的粒度变粗了，多个`Mapper namespace`下的所有操作都会对缓存使用造成影响

##### 原理

###### 处理流程

二级缓存一旦开启，将会有多个 `CachingExecutor` 来装饰 `Executor`，进入一级缓存的查询流程之前，先在 `CachingExecutor` 中进行二级缓存的查询，此时数据的查询流程是：

> 二级缓存 -> 一级缓存 -> 数据库

![image-20231217172029835](Mybatis%E5%9F%BA%E7%A1%80.assets/image-20231217172029835.png)

```javascript
// Configuration
protected final Map<String, Cache> caches = new StrictMap<>("Caches collection");
```

二级缓存是Configuration对象的成员变量，因此二级缓存的生命周期是整个应用级别的，并且是基于namespace构建的，一个namesapce构建一个缓存。

###### 缓存写入时机

**「二级缓存不像一级缓存那样查询完直接放入一级缓存，而是要等事务提交时才会将查询出来的数据放到二级缓存中。」**

因为如果事务1查出来直接放到二级缓存，此时事务2从二级缓存中拿到了事务1缓存的数据，但是事务1回滚了，此时事务2就会发生脏读。

![在这里插入图片描述](Mybatis%E5%9F%BA%E7%A1%80.assets/20201213203403672.png)

分析这种情况下，产生脏读的主要原因在于：<font color=red>同一事务下，先修改后查询，就算修改事务未提交，查询到的值也是修改后的值</font>。

如：余额开始为0元，一个事务先给余额增加20元，再查询余额为20元，再在查询基础上扣除10元结果应为10元，本次事务未提交之前，其他事务查询余额，余额还为0元，只有本事务可以查询到事务未提交之前的增删改查结果；但是如果事务查询出来就写入，其他事务就会查询到10元或者20元这个结果。

为了解决这一问题mybatis二级缓存机制就引入了事务管理器(暂存区)，所有变动的数据都会暂时存放到事务管理器的暂存区中，只有执行提交动作后才会真正的将数据从暂存区中填充到二级缓存中。

##### 二级缓存总结

mybatis的一级缓存和二级缓存都是基于本地的，分布式环境下必然会出现脏读。

二级缓存可以通过实现Cache接口，来集中管理缓存，避免脏读，但是有一定的开发成本，并且在多表查询时，使用不当极有可能会出现脏数据。

**「除非对性能要求特别高，否则一级缓存和二级缓存都不建议使用，它们只适用于单体项目，现在基本都是分布式或者微服务框架使用的话会存在数据不一致，在业务层面上使用其他机制实现需要的缓存功能，让Mybatis老老实实做它的ORM框架」**

#### 一级缓存VS二级缓存

- 作用范围不同

一级缓存的作用域是SQlSession, 不同的SqlSession不共享缓存，在同一个SqlSession中，执行相同的SQL查询时；第一次会去查询数据库，并写在缓存中，第二次会直接从缓存中取。

二级缓存的作用域是Namespace，相同Namespace的不同SQLSession共享一个缓存。不同的sqlSession两次执行相同的namespace下的sql语句，且向sql中传递的参数也相同，即最终执行相同的sql语句，则第一次执行完毕会将数据库中查询的数据写到缓存，第二次查询会从缓存中获取数据，不再去底层数据库查询，从而提高效率。

- 默认值不同

一级缓存默认开启，二级缓存默认不开启。

- 存储结构不同

一级缓存是基于内存的，本质上是一个HashMap，不需要对JavaBean对象实现序列化接口。

二级缓存的缓存介质有多种多样，而并不一定是在内存中，可以通过实现cache接口自定义二级缓存类型，所以需要对JavaBean对象实现序列化接口。

- 缓存写入的时机不同

一级缓存由于是sqlSession级别的，和其他sqlSession是隔离的，数据读取出来及写入到缓存中。

二级缓存是多个sqlSession共享的缓存，要等事务提交时才会将查询出来的数据放到二级缓存中。

#### 第三方缓存

MyBatis定义了缓存接口Cache。我们可以通过实现Cache接口来**自定义二级缓存**，这里的三方缓存是作为二级缓存使用的。

二级缓存用的也比较少，这里暂时不拓展展开，需要知道有个东西即可：

- 实现org.apache.ibatis.cache.Cache接口
- 用作二级缓存
- 使用<cache type="">来配置。

