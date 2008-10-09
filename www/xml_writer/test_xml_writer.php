<?php
	require('xmlwriterclass.php');
	
	/*
	 *  First create an object of the class.
	 */
	$xml_writer_object=&new xml_writer_class;
	
	/*
	 *  Now, start defining the XML document from the root tag.
	 */
	$noattributes=array();
	$xml_writer_object->addtag('myxmldocument',$noattributes,'',$root,1);
	
	/*
	 *  Then define the rest of the document tags and data.
	 */
	$xml_writer_object->addtag('name',$noattributes,$root,$toptag,0);
	$xml_writer_object->adddata('John Doe',$toptag,$path);
	
	/*
	 *  Tags may have attributes.
	 */
	$attributes=array();
	$attributes['country']='us';
	$xml_writer_object->addtag('address',$attributes,$root,$toptag,1);
	
	/*
	 *  Tags and the correspondent data may be added with a single function call.
	 */
	$xml_writer_object->adddatatag('street',$noattributes,'Wall Street, 1641',$toptag,$datatag);
	$xml_writer_object->adddatatag('zip',$noattributes,'NY 72834',$toptag,$datatag);
	
	/*
	 *  Any time before generating the document you may specify a DTD to let other tools validate it...
	 */
	$xml_writer_object->dtdtype='SYSTEM';
	$xml_writer_object->dtdurl='myxmldocument.dtd';
	
	/*
	 *  ...and a stylesheet for displaying the document in particular way in XML capable browsers.
	 */
	$xml_writer_object->stylesheettype='text/xsl';
	$xml_writer_object->stylesheet='myxmldocument.xsl';
	
	/*
	 *  When you are done with the XML document definition, generate it.
	 */
	if($xml_writer_object->write($output))
	{
		
		/*
		 *  If the document was generated successfully, you may now output it.
		 */
		echo $output;
	}
	else
	{
		
		/*
		 *  If there was an error, output it as well.
		 */
		echo ('Error: '.$xml_writer_object->error);
	}
?>
