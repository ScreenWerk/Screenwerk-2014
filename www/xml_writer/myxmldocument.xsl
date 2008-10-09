<?xml version="1.0" encoding="iso-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rss="http://purl.org/rss/1.0/" xmlns="http://www.w3.org/1999/xhtml">

<xsl:output method="html"/>

<xsl:template match="address">
	<li><b>Address</b></li>
	<ul>
		<li><b>Street:</b> <xsl:value-of select="street"/></li>
		<li><b>Zip:</b> <xsl:value-of select="zip"/></li>
		<li><b>Country:</b> <xsl:value-of select="@country"/></li>
	</ul>
</xsl:template>

<xsl:template match="name">
	<li><b>Name:</b> <xsl:value-of select="."/></li>
</xsl:template>

<xsl:template match="/">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=iso-8859-1" />
<title>MyXMLDocument information</title>
</head>
<body>

<h1><center>MyXMLDocument information</center></h1>

<hr />

<ul>
	<xsl:apply-templates/>
</ul>

<hr />

</body>
</html>
</xsl:template>

</xsl:stylesheet>
