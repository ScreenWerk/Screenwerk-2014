<?php

	class Schedule_model extends Model {

		function __construct() {
			parent::Model();
			//$this->load->model('Dimension_model', 'dimension', TRUE);
			//$this->load->model('Collection_model', 'collection', TRUE);
		}



		function get_list() {
			$this->db->select('id, name');
			$this->db->from('schedules');
			$this->db->where('customer_id', $_SESSION['user']['customer_id']);
			$this->db->order_by('name'); 
			$query = $this->db->get()->result_array();
			
			foreach($query as $row) {
				$data[$row['id']] = $row;
				unset($data[$row['id']]['id']);
			}
			return $data;
		}



		function get_name($id) {
			$this->db->select('name');
			$this->db->where('id', $id);
			$result = $this->db->get('schedules');
			
			if ($result->num_rows() > 0) return $result->row()->name;

		} 



		function get_names_list() {
			foreach($this->get_list() as $key => $value):
				$result[$key] = $value['name'];
			endforeach;
			
			return $result;
		} 



    function find($id)
    {
        $this->db->where('id='.$id);
        $query = $this->db->get( 'schedules' );
        return $query->row_array();
    }
    
    
    
    function find_all()
    {
        $query = $this->db->get( 'schedules', 10 );
        return $query->result_array();
    }
    
    
    
   function involved_medias($id)
   {
      $_involved_medias = array();
      
      $ScheduledCollections = $this->list_schedule_collections($id);
      foreach( $ScheduledCollections as $ScheduledCollection )
      {
         $_cim = $this->Collection->involved_medias( $ScheduledCollection['id'] );
         $_involved_medias = array_merge( $_involved_medias, $_cim );
      }
      array_multisort( array_keys($_involved_medias), $_involved_medias );
#      var_dump($_involved_medias);
      return ($_involved_medias);
   }      
    
    
    
    
    
    
   function list_schedule_collections($id)
   {
      $ret_collections = array();
      $query = $this->db->query( '
   SELECT cs.id cs_id, c.id, c.name, cs.cron_minute, cs.cron_hour, cs.cron_day, cs.cron_month, cs.cron_weekday, cs.valid_from_date, cs.valid_to_date
     FROM sw_collections c
LEFT JOIN sw_collections_schedules cs on cs.collection_id = c.id
    WHERE cs.schedule_id = '.$id.'
 ORDER BY c.name
' );
      
      foreach( $query->result_array() as $_collection )
      {
         $_cs_id = $_collection['cs_id'];
         unset( $_collection['cs_id'] );
         $ret_collections[$_cs_id] = $_collection;
      }
      
      return $ret_collections;
   }
   
   
   
   function list_collections_excl($id)
   {
      $ret_collections = array();

      $query = $this->db->query( 'SELECT c.id, c.name FROM sw_collections c
      RIGHT JOIN sw_schedules s on s.dimension_id = c.dimension_id
where c.id not in
( SELECT distinct c.id FROM sw_collections c
left join sw_collections_schedules cs on cs.collection_id = c.id
left join sw_schedules s on cs.schedule_id = s.id
where cs.schedule_id = '.$id.' OR s.dimension_id != c.dimension_id )
order by name' );
      foreach( $query->result_array() as $_collection )
      {
         $ret_collections[$_collection['id']] = $_collection['name'];
      }
      return $ret_collections;
   }
   
   
   
   function list_suitable_collections($id)
   {
      $ret_collections = array();

      $query = $this->db->query( '
SELECT c.id, c.name 
FROM sw_collections c 
RIGHT JOIN sw_schedules s on s.dimension_id = c.dimension_id 
ORDER BY c.name' );
      foreach( $query->result_array() as $_collection )
      {
         $ret_collections[$_collection['id']] = $_collection['name'];
      }
      return $ret_collections;
   }
   
   
   
   function add_collection()
   {
      $CL['schedule_id'] = $_POST['id'];
      $CL['collection_id'] = $_POST['collection_id'];
      $CL['cron_minute'] = $_POST['cron_minute'];
      $CL['cron_hour'] = $_POST['cron_hour'];
      $CL['cron_day'] = $_POST['cron_day'];
      $CL['cron_month'] = $_POST['cron_month'];
      $CL['cron_weekday'] = $_POST['cron_weekday'];
      $CL['valid_from_date'] = $_POST['valid_from_date'];
      $CL['valid_to_date'] = $_POST['valid_to_date'];
      $this->db->insert( 'collections_schedules', $CL );
   }
   
   
   
   function remove_collection( $cs_id )
   {
      $CL['id'] = $cs_id;
      $this->db->delete( 'collections_schedules', $CL );
   }
   
   
   
    /*
     *  Screens can only use schedules with matching dimension
     */
    function find_by_dimension($dimension_id)
    {
        $this->db->where('dimension_id',$dimension_id);
        $query = $this->db->get( 'schedules' );
        return $query->result_array();
    }
    
    function create($name,$width,$height)
    {
        $Dimension = $this->Dimension->createfind($width,$height);
        return $this->insert($name,$Dimension['id']);
    }
    function insert($name,$dimension_id)
    {
        $Schedule['name'] = $name;
        $Schedule['dimension_id'] = $dimension_id;
        $this->db->where($Schedule);
        $query = $this->db->get('schedules');
        if( $query->num_rows() == 1 )
        {
            return $query->row_array();
        }
        $this->db->insert('schedules', $Schedule);
        $Schedule['id'] = $this->db->insert_id();
        return $Schedule;
    }



   function save($Schedule)
   {
      return $this->update($Schedule['id'],$Schedule['name'],$Schedule['dimension_id']);
   }



   function update($id,$name,$dimension_id)
   {
      $Schedule['id'] = $id;
      $this->db->where($Schedule);
      $Schedule['name'] = $name;
      $Schedule['dimension_id'] = $dimension_id;
      $this->db->update('schedules',$Schedule);
   }
  
  
    
    function delete($id)
    {
        $this->db->where('id='.$id);
        $this->db->delete( 'schedules' );
    }

}
?>
