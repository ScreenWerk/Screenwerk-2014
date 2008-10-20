CREATE TABLE `sw_aspects` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `ratio` decimal(3,2) unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COMMENT='most common aspect ratios';

INSERT INTO `sw_aspects` VALUES (7,'1.33','TV 4:3','A standard television set; roughly equivalent to 4:3.'),(9,'1.37','35mm','Referred to as the academy aspect ratio. The standard for films shot before the mid-1950s. 35mm film.'),(10,'1.66','Wide TV','A bit wider than a standard TV, but not by much.'),(11,'1.78','HDTV 16:9','The dimensions of a widescreen television set'),(12,'1.85','Widescreen movie','Popular aspect ratio for many movies.'),(13,'2.35','Ultra widescreen movie','Ultra widescreen movie');

CREATE TABLE `sw_bundles` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

INSERT INTO `sw_bundles` VALUES (7,'640x480 five shorts'),(8,'JCS bundle'),(9,'Qatsi trilogy bundle');

CREATE TABLE `sw_bundles_layouts` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `bundle_id` int(10) unsigned NOT NULL,
  `layout_id` int(10) unsigned NOT NULL,
  `dimension_id` int(10) unsigned NOT NULL,
  `position_x` smallint(5) unsigned NOT NULL,
  `position_y` smallint(6) unsigned NOT NULL,
  `position_z` smallint(6) unsigned NOT NULL,
  `start_sec` smallint(6) unsigned default NULL,
  `stop_sec` smallint(6) unsigned default NULL,
  PRIMARY KEY  (`id`),
  KEY `UI` USING BTREE (`layout_id`,`bundle_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='bundles are placed according to layout';

INSERT INTO `sw_bundles_layouts` VALUES (1,7,4,26,1,1,0,0,0),(2,8,5,32,1,1,0,0,0),(3,9,5,32,321,241,0,0,0);

CREATE TABLE `sw_collections` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `dimension_id` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `collection_ui` USING BTREE (`name`,`dimension_id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

INSERT INTO `sw_collections` VALUES (7,26,'short films collection'),(8,26,'long films collection'),(9,26,'640x480 Black Screen Collection'),(10,34,'1 wide and 3 normal movies');

CREATE TABLE `sw_collections_schedules` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `collection_id` int(10) unsigned NOT NULL,
  `schedule_id` int(10) unsigned NOT NULL,
  `cron_minute` varchar(255) default NULL,
  `cron_hour` varchar(255) default NULL,
  `cron_day` varchar(255) default NULL,
  `cron_month` varchar(255) default NULL,
  `cron_weekday` varchar(255) default NULL,
  `valid_from_date` date default NULL,
  `valid_to_date` date default NULL,
  PRIMARY KEY  (`id`),
  KEY `UI` (`schedule_id`,`collection_id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COMMENT='collections are scheduled in crontab-like manner';

INSERT INTO `sw_collections_schedules` VALUES (1,7,20,'0','09','*','*','*','0000-00-00','0000-00-00'),(2,8,20,'0','12','*','*','6,7','0000-00-00','0000-00-00'),(3,7,20,'0','15','*','*','6,7','0000-00-00','0000-00-00'),(4,8,20,'0','19','*','*','*','0000-00-00','0000-00-00'),(6,7,20,'0,20,40','*','*','*','*','2008-02-22','2008-02-23'),(7,9,20,'*','0,1,2,3,4,5,6,7,8,23','*','*','*','0000-00-00','0000-00-00'),(10,8,21,'0','8','*','*','*','0000-00-00','0000-00-00'),(12,7,21,'0','20','*','*','*','0000-00-00','0000-00-00');

CREATE TABLE `sw_dimensions` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `dimension_x` int(10) unsigned NOT NULL,
  `dimension_y` int(10) unsigned NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `dimension_UI` (`dimension_x`,`dimension_y`)
) ENGINE=MyISAM AUTO_INCREMENT=35 DEFAULT CHARSET=utf8;

INSERT INTO `sw_dimensions` VALUES (26,640,480),(27,432,240),(28,608,256),(29,464,256),(30,576,320),(31,384,224),(32,320,240),(33,0,0),(34,1280,800);

CREATE TABLE `sw_layouts` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `dimension_id` int(10) unsigned NOT NULL,
  `name` varchar(255) default NULL,
  `length` smallint(5) unsigned NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

INSERT INTO `sw_layouts` VALUES (4,26,'640x480 fullscreen five shorts',700),(5,26,'filmfilmfilm',1800);

CREATE TABLE `sw_layouts_collections` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `layout_id` int(10) unsigned NOT NULL,
  `collection_id` int(10) unsigned NOT NULL,
  `frequency` smallint(5) unsigned NOT NULL default '1',
  `appearances` smallint(5) unsigned default NULL,
  `importance` smallint(5) unsigned default NULL,
  `probability` smallint(5) unsigned default NULL,
  `valid_from_date` date default NULL,
  `valid_to_date` date default NULL,
  PRIMARY KEY  (`id`),
  KEY `UI` (`collection_id`,`layout_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='collection is a container for layouts';

INSERT INTO `sw_layouts_collections` VALUES (1,4,7,0,0,0,0,'0000-00-00','0000-00-00'),(2,5,8,0,0,0,0,'0000-00-00','0000-00-00'),(6,5,7,0,2,0,0,'0000-00-00','0000-00-00');

CREATE TABLE `sw_medias` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `filename` varchar(255) NOT NULL,
  `dimension_id` int(10) unsigned NOT NULL,
  `location` enum('ORIGINAL','CONVERTED') default NULL,
  `length` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;

INSERT INTO `sw_medias` VALUES (8,'037. The Bead Game (NFBC-Ishu Patel, 1977).avi',26,'ORIGINAL','329.00'),(10,'052. The Skeleton Dance (Walt Disney, 1929).avi',26,'ORIGINAL','331.87'),(11,'055. The Flying Man (George Dunning, 1962).avi',26,'ORIGINAL','152.60'),(12,'048. Balance (Wolfgang & Christoph Lauenstein, 1989).avi',26,'ORIGINAL','460.48'),(13,'Powaqqatsi (Godfrey Reggio, 1988).avi',27,'ORIGINAL','5739.52'),(14,'Jesus.Christ.Superstar.1973.DVDRip.XviD.AR.avi',28,'ORIGINAL','6395.89'),(15,'Koyaanisqatsi (Godfrey Reggio, 1983).avi',29,'ORIGINAL','4954.04'),(16,'Naqoyqatsi (Godfrey Reggio, 2002).avi',30,'ORIGINAL','5360.86'),(17,'Jesus Christ Superstar (2000) [eng].avi',31,'ORIGINAL','6418.00'),(9,'054. Sisyphus (Pannónia Filmstúdió-Marcell Jankovics, 1974).avi',26,'ORIGINAL','125.04');

CREATE TABLE `sw_medias_bundles` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `bundle_id` int(10) unsigned NOT NULL,
  `media_id` int(10) unsigned NOT NULL,
  `frequency` int(10) unsigned NOT NULL default '1' COMMENT 'Will appear on each #N''th bundle run. mod(run_number, frequency).',
  `appearances` int(10) unsigned default NULL COMMENT 'Will appear on #N bundle runs.',
  `importance` int(10) unsigned default NULL COMMENT 'Playlist is ordered in ascendin order.',
  `probability` tinyint(3) unsigned NOT NULL default '100' COMMENT 'Probability, that this clip will be included in bundle run. Cumulative with frequency.',
  `valid_from_date` date default NULL,
  `valid_to_date` date default NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `UI` USING BTREE (`bundle_id`,`media_id`),
  KEY `media_I` (`media_id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COMMENT='bundle is container for media';

INSERT INTO `sw_medias_bundles` VALUES (1,7,8,1,0,0,100,'0000-00-00','0000-00-00'),(2,7,12,1,0,0,100,'0000-00-00','0000-00-00'),(3,7,10,1,0,0,100,'0000-00-00','0000-00-00'),(4,7,9,1,0,0,100,'0000-00-00','0000-00-00'),(5,7,11,1,0,0,100,'0000-00-00','0000-00-00'),(6,8,14,1,0,0,100,'0000-00-00','0000-00-00'),(7,8,17,1,0,0,100,'0000-00-00','0000-00-00'),(8,9,15,1,0,0,100,'0000-00-00','0000-00-00'),(9,9,16,1,0,0,100,'0000-00-00','0000-00-00'),(10,9,13,1,0,0,100,'0000-00-00','0000-00-00'),(11,7,17,1,0,0,100,'2008-02-18','2008-02-20');

CREATE TABLE `sw_schedules` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `dimension_id` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `schedule_ui` (`name`,`dimension_id`),
  KEY `UI` (`name`,`dimension_id`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

INSERT INTO `sw_schedules` VALUES (20,26,'1st functional schedule'),(21,26,'LFS');

CREATE TABLE `sw_screens` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `schedule_id` int(10) unsigned NOT NULL,
  `dimension_id` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

INSERT INTO `sw_screens` VALUES (6,20,26,'pisitelku'),(7,21,26,'lfs');
