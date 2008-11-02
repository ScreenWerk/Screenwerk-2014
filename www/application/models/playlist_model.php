<?php
class CronDate
{
   function __construct( $i )
   {
      $this->mktime = mktime(0, 0, 0, date("m")  , date("d")+$i, date("Y"));
      $this->date = date( 'd-m-Y', $this->mktime );
      list( $this->day, $this->month, $this->year, $this->weekday ) =
         split( "-", date( 'd-m-Y-N', $this->mktime ) );
   }
}


class PlaylistDay
{
   var $CronDate;
   var $collections = array();
   var $layouts = array();
   var $bundles = array();
   var $medias = array();
   var $events = array();
   
   function __construct( $i )
   {
      $this->CronDate =& new CronDate( $i );
   }
}


/* obsolete
class PlaylistEvent
{
   function __construct( $time, $event, $event_id,
                         $media_id = false, $geometry = false, $end_time = false )
   {
         $this->time = $time;
         $this->event = $event;
         $this->event_id = $event_id;
         if( !( $media_id === false ) ) $this->media_id = $media_id;
         if( !( $geometry === false ) ) $this->geometry = $geometry;
         if( !( $end_time === false ) ) $this->end_time = $end_time;
   }
}
*/



class Playlist_model extends Model 
{
   var $PlaylistDays = array();
//   var $PlaylistEvents = array();
   var $PlaylistMedias = array();
   var $current_PD;
   
   var $models = array(
            'Screen', 
            'Collection', 
            'Schedule',
            'Layout',
            'Bundle',
            'Media'
         );

	function __construct()
	{
      parent::Model();
      foreach( $this->models as $_model ) $this->load->model($_model.'_model',$_model,TRUE);
	}



	function create_playlist_for_screen( $screen_id, $no_of_days )
	{
	   $this->screen_id = $screen_id;
	   
      $data['query'] = $this->Screen->get_one( $screen_id );
      $_schedule_id = $data['query']['schedule_id'];
      
      $ScheduledCollections = $this->Schedule->list_schedule_collections( $_schedule_id );
      for( $i=0; $i<$no_of_days; $i++ )
      {
         $this->PlaylistDays[$i] =& new PlaylistDay( $i );
         $this->current_PD =& $this->PlaylistDays[$i];
         
         $this->create_playlist_collections( $ScheduledCollections );
#continue;
         $this->create_playlist_layouts();

         $this->create_layout_bundles();

         $this->create_bundled_medias();
         
#         $this->PlaylistEvents = array_merge( $this->PlaylistEvents, $this->current_PD->events );
         
#         print_r( array( $this->current_PD->CronDate->date,array_keys( $this->current_PD->collections ) ) );
      }
#      print_r($this->PlaylistEvents);
      return array( 'PlaylistDays' => &$this->PlaylistDays, 'PlaylistMedias' => &$this->PlaylistMedias );
   }
   
   
   
   # A copy is passed here
   function create_playlist_collections( $ScheduledCollections )
   {
      $this->filter_scheduled_collections_by_validdate( $ScheduledCollections );
      $this->filter_scheduled_collections_by_crondate( $ScheduledCollections );

      /*
      * Create playlist with all involved collections
      */
      $collections = $this->arrange_scheduled_collections_by_crontime( $ScheduledCollections );

      /*
      * Remove collections with conflicting ID's or overlapping start times.
      */
      $this->solve_scheduled_collections_collisions( $collections );
   }      



   function create_playlist_layouts()
   {
      $this->collect_playlist_layouts();
      $this->filter_collected_layouts_by_validdate();
      $this->solve_collected_layout_collisions();
   }
   
   
   
   function create_layout_bundles()
   {
      foreach( $this->current_PD->layouts as &$layout )
      {
         $_bundles = $this->Layout->list_layout_bundles($layout['id']);
         #print_r($_bundles);

         if( count( $_bundles ) == 0 ) continue;
         foreach( array_keys( $_bundles ) as $b_id )
         {
            $_bundle =& $_bundles[$b_id];
            if( $_bundle['start_sec'] >= $layout['length'] ) continue;
            if( $_bundle['stop_sec'] > 0 )
               $_bundle['stop_sec'] = min( $_bundle['stop_sec'], $layout['length'] );
            else
               $_bundle['stop_sec'] = $layout['length'];
            
            $_bundle['start_time'] = $this->add_secs( $layout['start_time'], $_bundle['start_sec'] );
            $_bundle['end_time'] = $this->add_secs( $layout['start_time'], $_bundle['stop_sec'] );
            $_bundle['duration'] = $_bundle['stop_sec'] - $_bundle['start_sec'];
#            print_r(array("L"=>$layout,"B"=>$_bundle));
            $_bundle['id'] = $b_id;
            
            $this->current_PD->bundles[] = $_bundle;
         }
      }
   }
   
   
   
   function create_bundled_medias()
   {
      $this->collect_playlist_medias();
   }
   
   
   
//==========================================//



   function solve_collected_layout_collisions()
   {
      /*
      *  Remove repeating layouts.
      */
      #return;
      $keys = array_keys( $this->current_PD->layouts );
      #print_r($keys);
      foreach( $keys as $key )
      {
         if( !isset( $_last_layout ) )
         {
            $_last_layout =& $this->current_PD->layouts[$key];
            continue;
         }
         $_current_layout =& $this->current_PD->layouts[$key];

         if( $_last_layout['id'] == $_current_layout['id'] )
         {
            unset( $this->current_PD->layouts[$key] );
            #print_r(array('L'=>$_last_layout,'C'=>$_current_layout));
            $_last_layout['length'] += $_current_layout['length'];
            $_last_layout['end_time'] = $_current_layout['end_time'];
            #print_r(array('L'=>$_last_layout));
         }
         else
         {
            $_last_layout =& $this->current_PD->layouts[$key];
         }
      }
   }



   function collect_playlist_medias()
   {
      $_event_id = 0;
      foreach( $this->current_PD->bundles as &$bundle )
      {
         $_medias = $this->Bundle->list_bundled_medias($bundle['id']);

         if( count( $_medias ) == 0 ) continue;

         $_secs = 0;
         $m_count = array();
         while( $_secs < $bundle['duration'] && count( $_medias ) > 0 )
         {
            foreach( array_keys( $_medias ) as $m_id )
            {
               $_media =& $_medias[$m_id];
               $_media['id'] = $m_id;
               $_media['bundle_id'] = $bundle['id'];
#               print_r($_media);
               if( !isset($m_count[$m_id]) ) $m_count[$m_id] = 0;
               if( ( $_media['appearances'] > 0 && $_media['appearances'] <= $m_count[$m_id] )
                     || $_media['length'] <= 0 )
               {
                  unset($_medias[$m_id]);
                  continue;
               }
               if( $_secs >= $bundle['duration'] ) break;
               
               $_media['start_time'] = $this->add_secs( $bundle['start_time'], $_secs );
               $_secs = $_secs + $_media['length'];
               if( $_secs >= $bundle['duration'] )
               {
                  $_media['length'] = $_media['length'] - ( $_secs - $bundle['duration'] );
                  if( $_media['length'] <= 0 )
                  {
                     unset($_medias[$m_id]);
                     continue;
                  }
               }
               $_media['end_time'] = $this->add_secs( $_media['start_time'], $_media['length'] );
               
               $this->current_PD->medias[] = $_media;
               
               //
               // List all medias used in current playlists and prepare target filenames 
               //   for media monitor to pick up and
               //   pass to converter
               $_source_name = $_media['filename'];
               $_split = explode( '.', $_source_name );
               $_ext = array_pop($_split);
               $_target_name = $this->screen_id . '_' . $_media['media_id'].'_'.$bundle['width'].'x'.$bundle['height'].'.'.$_ext;
               $this->PlaylistMedias[$_target_name] = $_source_name;
               
               
               
               $this->current_PD->events[] = 
                  implode( ' ', 
                           array( $_media['start_time'],
                                  'start',
                                  $_event_id,
                                  $_media['media_id'],
                                  $_media['type'],
                                  $bundle['width'].'x'.$bundle['height'].'+'.$bundle['position_x'].'+'.$bundle['position_y'],
                                  $_media['end_time'] 
                                )
                         );
               $event_sort_time[] = $_media['start_time'];
               $this->current_PD->events[] =
                  implode( ' ',
                           array ( $_media['end_time'],
                                   'stop',
                                   $_event_id
                                 )
                         );
               $_event_id ++;
               $event_sort_time[] = $_media['end_time'];

               $m_count[$m_id] ++;
            }
         }
      }
      array_multisort( $event_sort_time, $this->current_PD->events );
   }

    

   function collect_playlist_layouts()
   {
#         print_r($this->current_PD->collections);
      foreach( $this->current_PD->collections as &$collection )
      {
         $_layouts = $this->Collection->list_collection_layouts($collection['id']);

         if( count( $_layouts ) == 0 ) continue;

         $_secs = 0;
         $lo_count = array();
         while( $_secs < $collection['duration'] && count( $_layouts ) > 0 )
         {
            foreach( array_keys( $_layouts ) as $l_id )
            {
               $_layout =& $_layouts[$l_id];
               $_layout['id'] = $l_id;
               if( !isset($lo_count[$l_id]) ) $lo_count[$l_id] = 0;
               if( ( $_layout['appearances'] > 0 && $_layout['appearances'] <= $lo_count[$l_id] )
                     || $_layout['length'] <= 0 )
               {
                  unset($_layouts[$l_id]);
                  continue;
               }
               if( $_secs >= $collection['duration'] ) break;
               
               $_layout['start_time'] = $this->add_secs( $collection['start_time'], $_secs );
               $_secs = $_secs + $_layout['length'];
               if( $_secs >= $collection['duration'] )
               {
                  $_layout['length'] = $_layout['length'] - ( $_secs - $collection['duration'] );
                  if( $_layout['length'] <= 0 )
                  {
                     unset($_layouts[$l_id]);
                     continue;
                  }
               }
               $_layout['end_time'] = $this->add_secs( $_layout['start_time'], $_layout['length'] );
               
               $this->current_PD->layouts[] = $_layout;
               $lo_count[$l_id] ++;
            }
         }
      }
   }      

    

   function solve_scheduled_collections_collisions( &$collections )
   {
      /*
      *  Remove repeating collections.
      *  Also get rid of 0-length collections.
      */
      foreach( array_keys( $collections ) as $key )
      {
         $_current_collection =& $collections[$key];
         $_current_collection['end_time'] = '24:00';
         $_current_collection['duration'] = $this->sec_interval($_current_collection['start_time'], $_current_collection['end_time']);

         if( count( $this->current_PD->collections ) == 0 )
         {
            $this->current_PD->collections[] = $_current_collection;
            continue;
         }
         
         
         $_last_collection = array_pop( $this->current_PD->collections );
         
         if( $_last_collection['start_time'] == $_current_collection['start_time'] )
         {
            if( count( $this->current_PD->collections ) == 0 )
            {
               $this->current_PD->collections[] = $_current_collection;
               continue;
            }
            $skipped_collections[] = $_last_collection;
            $_last_collection = array_pop( $this->current_PD->collections );
#            $_last_collection['end_time'] = '24:00';
#            $_last_collection['duration'] = $this->sec_interval($_last_collection['start_time'], $_last_collection['end_time']);
         }
         
         
         if ( $_last_collection['id'] == $_current_collection['id'] )
         {
            $this->current_PD->collections[] = $_last_collection;
            $skipped_collections[] = $_current_collection;
            continue;
         }


         $_last_collection['end_time'] = $_current_collection['start_time'];
         $_last_collection['duration'] = $this->sec_interval($_last_collection['start_time'], $_last_collection['end_time']);
         $_current_collection['end_time'] = '24:00';
         $_current_collection['duration'] = $this->sec_interval($_current_collection['start_time'], $_current_collection['end_time']);
         $this->current_PD->collections[] = $_last_collection;
         $this->current_PD->collections[] = $_current_collection;
      }
   }



   /*
   * Create playlist with all involved collections
   */
   function &arrange_scheduled_collections_by_crontime( &$ScheduledCollections )
   {
      $sort_hours = $sort_minutes = $sort_sc_id = $collections = array();
      foreach( $ScheduledCollections as &$ScheduledCollection )
      {
         for( $hour=0; $hour<24; $hour++ )
         {
            if( !$this->test_cron_item( $ScheduledCollection['cron_hour'], $hour ) )
               continue;

            for( $minute=0; $minute<60; $minute++ )
            {
               if( !$this->test_cron_item( $ScheduledCollection['cron_minute'], $minute ) )
                  continue;
               
               #Here we are - minute, hour, day, month and weekday matching the schedule
               $collection['id'] = $ScheduledCollection['id'];
               $collection['name'] = $ScheduledCollection['name'];
               $collection['start_time'] = date( 'H:i', mktime( $hour, $minute ) );
               $sort_hours[] = $hour;
               $sort_minutes[] = $minute;
               $sort_sc_id[] = $ScheduledCollection['id'];

               $collections[] = $collection;
            }
         }
      }
      array_multisort( $sort_hours, $sort_minutes, $sort_sc_id, $collections );
      return $collections;
   }
   


   function filter_collected_layouts_by_validdate()
   {
      $filter_date = $this->current_PD->CronDate->mktime;
      $min_date = mktime( 0, 0, 0, 0, 0, 0 );
      $cl_keys = array_keys($this->current_PD->layouts);
      foreach( $cl_keys as $cl_key )
      {
         list($_from_date['year'],$_from_date['month'],$_from_date['day']) 
            = split('-',$this->current_PD->layouts[$cl_key]['valid_from_date']);
         $from_date = mktime( 0, 0, 0, $_from_date['month'], $_from_date['day'], $_from_date['year'] );

         list($_to_date['year'],$_to_date['month'],$_to_date['day']) 
            = split('-',$this->current_PD->layouts[$cl_key]['valid_to_date']);
         $to_date = mktime( 0, 0, 0, $_to_date['month'], $_to_date['day'], $_to_date['year'] );
         
         if(    ( $from_date != $min_date && $from_date > $filter_date ) 
             || ( $to_date != $min_date && $to_date < $filter_date ) )
            unset( $this->current_PD->layouts[$cl_key] );
      }
   }



   function filter_scheduled_collections_by_validdate( &$ScheduledCollections )
   {
      $filter_date = $this->current_PD->CronDate->mktime;
      $min_date = mktime( 0, 0, 0, 0, 0, 0 );
      $sc_keys = array_keys($ScheduledCollections);
      foreach( $sc_keys as $sc_key )
      {
         list($_from_date['year'],$_from_date['month'],$_from_date['day']) 
            = split('-',$ScheduledCollections[$sc_key]['valid_from_date']);
         $from_date = mktime( 0, 0, 0, $_from_date['month'], $_from_date['day'], $_from_date['year'] );

         list($_to_date['year'],$_to_date['month'],$_to_date['day']) 
            = split('-',$ScheduledCollections[$sc_key]['valid_to_date']);
         $to_date = mktime( 0, 0, 0, $_to_date['month'], $_to_date['day'], $_to_date['year'] );
         
         if(    ( $from_date != $min_date && $from_date > $filter_date ) 
             || ( $to_date != $min_date && $to_date < $filter_date ) )
            unset( $ScheduledCollections[$sc_key] );
      }
   }



   function filter_scheduled_collections_by_crondate( &$ScheduledCollections )
   {
      list( $day, $month, $weekday ) = array ( $this->current_PD->CronDate->day,
                                               $this->current_PD->CronDate->month, 
                                               $this->current_PD->CronDate->weekday );
      $sc_keys = array_keys($ScheduledCollections);
#      print_r($sc_keys);
      foreach( $sc_keys as $sc_key )
         if( $this->test_cron_day_month_weekday( $ScheduledCollections[$sc_key], $day, $month, $weekday ) == false )
            unset( $ScheduledCollections[$sc_key] );
   }



   function add_secs( $time, $secs )
   {
      $date = date_parse( $time );
      $millisecs = round( $secs - floor($secs) + $date['fraction'] , 2 );
      $millisecs = $millisecs - floor($millisecs);
      
      $mktime = mktime( $date['hour'], $date['minute'], $date['second'] + $secs + $date['fraction'] ) + $millisecs;
      $ret_date = date( 'H:i:s', $mktime ) . '.' . sprintf("%02d",$millisecs*100);
#echo("$time | $secs | $millisecs | $ret_date \n");
      return $ret_date;
   }
   
   
   
   function sec_interval( $start, $end )
   {
      list( $start_hour, $start_minute ) = split( ":", $start );
      $start_mktime = mktime( $start_hour, $start_minute );
      list( $end_hour, $end_minute ) = split( ":", $end );
      if( $end == "24:00" )
         $end_mktime = mktime( $end_hour, $end_minute );
      else
         $end_mktime = mktime( $end_hour, $end_minute );
         
      return $end_mktime - $start_mktime;
   }



   function cron_date( $i )
   {
      $cron_date['mktime'] = mktime(0, 0, 0, date("m")  , date("d")+$i, date("Y"));
      $cron_date['date'] = date( 'j-n-Y', $cron_date['mktime'] );
      list( $cron_date['day'], $cron_date['month'], $cron_date['year'], $cron_date['weekday'] ) =
         split( "-", date( 'j-n-Y-N', $cron_date['mktime'] ) );
      return $cron_date;
   }



   function test_cron_day_month_weekday( $test_container, $day, $month, $weekday )
   {
#   print_r( array( $test_container, $day, $month, $weekday ) );
      return $this->test_cron_item( $test_container['cron_day'], $day )
          && $this->test_cron_item( $test_container['cron_month'], $month )
          && $this->test_cron_item( $test_container['cron_weekday'], $weekday );
   }
   function test_cron_item( $haystack, $needle )
   {
      if( $haystack != "*" )
      {
         $parts = split( ',', $haystack );
         if( !in_array( $needle, $parts ) )
         {
#   print_r(array('h'=>$haystack,'n'=>$needle,0));
            return false;
         }
      }
#   print_r(array('h'=>$haystack,'n'=>$needle,1));
      return true;
   }
   
   
}
?>
