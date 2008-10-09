<div class="sw-menu">
<?php
#print_r($this);
foreach ($this->data['menuitems'] as $menuitem)
{
   $links[] = anchor($menuitem['code'], $menuitem['name']);
}

$link_str = implode($links, "&nbsp;~|~&nbsp");
$_needle = '"' . $heading . 's"';
$_replace = $_needle . ' class="selected"';
echo str_replace( $_needle, $_replace, $link_str ) . '&nbsp;~|~&nbsp<a href="file:///data/screenwerk/bin/www/screen.html">SCREEN</a>';
#echo $_needle . $_replace .' ... '.$link_str;
?>
</div><!-- sw-menu -->


