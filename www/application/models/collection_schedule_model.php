<?php

class Collection_schedule_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Collection_model', 'collection');
		$this->load->model('Schedule_model', 'schedule');
	}



	function get_list($collection_id = NULL, $schedule_id = NULL) {
		$this->db->select('id, collection_id, schedule_id, cron_minute, cron_hour, cron_day, cron_month, cron_weekday, valid_from_date, valid_to_date');
		$this->db->from('collections_schedules');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		if(isset($collection_id)) $this->db->where('collection_id', $collection_id);
		if(isset($schedule_id)) $this->db->where('schedule_id', $schedule_id);
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				unset($data[$row['id']]['id']);
				$data[$row['id']]['collection'] = $this->collection->get_name($row['collection_id']);
				$data[$row['id']]['schedule'] = $this->schedule->get_name($row['schedule_id']);
			}
		} else {
			$data = array();
		}

		return $data;
	}


   function get_collections_for_schedule( $schedule_id )
   {
      if( isset( $this->CollectionsForSchedule[$schedule_id] ) )
      {
         return $this->CollectionsForSchedule[$schedule_id];
      }
		$this->db->select('cs.id cs_id, c.id, c.name, cs.cron_minute, cs.cron_hour, cs.cron_day, cs.cron_month, cs.cron_weekday, cs.valid_from_date, cs.valid_to_date');
		$this->db->from('collections_schedules AS cs');
		$this->db->join('collections AS c', 'c.id = cs.collection_id');
		$this->db->where('cs.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('cs.schedule_id', $schedule_id);
		$this->db->order_by('c.name', 'asc'); 
		$query = $this->db->get();

		if($query->num_rows() > 0)
		{
			foreach($query->result_array() as $row)
			{
				$this->CollectionsForSchedule[$schedule_id][$row['id']] = $row;
				//unset($this->CollectionsForSchedule[$schedule_id][$row['id']]['id']);
			}
		}
		else
		{
			$this->CollectionsForSchedule[$schedule_id] = array();
		}

		return $this->CollectionsForSchedule[$schedule_id];
   }
}

?>
