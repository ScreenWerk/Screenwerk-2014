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
			}
		} else {
			foreach($query->field_data() as $row) {
				$data[0][$row->name] = NULL;
			}
			$data[0]['collection_id'] = $collection_id;
			$data[0]['schedule_id'] = $schedule_id;
		}

		return $data;
	}



	function delete($id) {
	   $collection_id_a = $this->input->post('collection_id');
	   $collection_id = $collection_id_a[$id];
	   $schedule_id_a = $this->input->post('schedule_id');
	   $schedule_id = $schedule_id_a[$id];

	   $this->collection->delete_fs($collection_id);

		$this->db->where('id', $id);
		$this->db->delete('collections_schedules');

	   $this->collection->update_fs($collection_id);
	   $this->schedule->update_fs($schedule_id);
	}



	function update() {

		$id = $this->input->post('id');
		$collection_id = $this->input->post('collection_id');
		$schedule_id = $this->input->post('schedule_id');
		$cron_minute = $this->input->post('cron_minute');
		$cron_hour = $this->input->post('cron_hour');
		$cron_day = $this->input->post('cron_day');
		$cron_month = $this->input->post('cron_month');
		$cron_weekday = $this->input->post('cron_weekday');
		$valid_from_date = $this->input->post('valid_from_date');
		$valid_to_date = $this->input->post('valid_to_date');
		
		foreach($id as $key => $value) {
			$data = array(
				'collection_id' => $collection_id[$key],
				'schedule_id' => $schedule_id[$key],
				'cron_minute' => $cron_minute[$key],
				'cron_hour' => $cron_hour[$key],
				'cron_day' => $cron_day[$key],
				'cron_month' => $cron_month[$key],
				'cron_weekday' => $cron_weekday[$key]
			);
			if($valid_from_date[$key]) $data['valid_from_date'] = date('Y-m-d', strtotime($valid_from_date[$key]));
			if($valid_to_date[$key]) $data['valid_to_date'] = date('Y-m-d', strtotime($valid_to_date[$key]));
			
			if($id[$key] > 0) {
				$this->db->where('id', $id[$key]);
				$this->db->update('collections_schedules', $data);
			} else {
				if($collection_id[$key] != 0 AND $schedule_id[$key] != 0) {
					$data['customer_id'] = $_SESSION['user']['customer_id'];
					$this->db->insert('collections_schedules', $data);
				}
			}
         $this->collection->update_fs($data['collection_id']);
         $this->schedule->update_fs($data['schedule_id']);
		}
		
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
