<?php

class Schedule_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Dimension_model', 'dimension');
	}



	function get_list() {
		$this->db->select('id, name, dimension_id');
		$this->db->from('schedules');
		$this->db->where('customer_id', $this->sess->customer_id);
		$this->db->order_by('name'); 
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				$data[$row['id']]['dimension'] = $this->dimension->get_name($row['dimension_id']);
				unset($data[$row['id']]['dimension_id']);
				unset($data[$row['id']]['id']);
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function get_one($id = NULL) {
	
		$this->db->select('id, name, dimension_id');
		$this->db->from('schedules');
		$this->db->where('customer_id', $this->sess->customer_id);
		$this->db->where('id', $id);
		$this->db->limit(1);
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			$data = $query->row_array();
		} else {
			foreach($query->field_data() as $row) {
				$data[$row->name] = NULL;
			}
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
		$result = array();
		
		foreach($this->get_list() as $key => $value):
			$result[$key] = $value['name'];
		endforeach;
		
		return $result;
	} 



	function get_screens($schedule_id) {	
		$this->db->select('screens.id, screens.name');
		$this->db->from('screens');
		$this->db->where(array('screens.schedule_id' => $schedule_id));
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				//unset($data[$row['id']]['id']);
			}
		} else {
			$data = array();
		}

		return $data;
	} 



	function get_collections($schedule_id) {	
		$this->db->select('collections.id,
		                   collections_schedules.cron_minute,
		                   collections_schedules.cron_hour,
		                   collections_schedules.cron_day,
		                   collections_schedules.cron_month,
		                   collections_schedules.cron_weekday,
		                   collections_schedules.valid_from_date,
		                   collections_schedules.valid_to_date');
		$this->db->from('collections');
		$this->db->join('collections_schedules', 'collections_schedules.collection_id = collections.id', 'left');
		$this->db->where(array('collections_schedules.schedule_id' => $schedule_id));
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				//unset($data[$row['id']]['id']);
			}
		} else {
			$data = array();
		}

		return $data;
	} 


	function delete($id) {
      $this->delete_fs($id);
		$this->db->where('id', $id);
		$this->db->delete('schedules');
	}



	function update() {
		$data = array(
			'name' => $this->input->post('name'),
			'dimension_id' => $this->input->post('dimension')
		);
		if($this->input->post('id') > 0) {
			$this->db->where('id', $this->input->post('id'));
			$this->db->update('schedules', $data);
			$this->update_fs($this->input->post('id'));
		} else {
			$data['customer_id'] = $this->sess->customer_id;
			$this->db->insert('schedules', $data);
		}
	}


	function delete_fs($schedule_id) {
	   //TODO: right now orphan layout files are remaining,
	   // plan is to remove all related layout files and refresh them
	   // after collection is unlinked.
 	   $screens = $this->get_screens($schedule_id);
	   foreach($screens as $screen_id => $screen) {
	      @ unlink(DIR_FTP_SCREENS."/$screen_id/$schedule_id.schedule");
      }
	}



	function update_fs($schedule_id) {
      if($schedule_id==0) return;
      
      $collections = $this->get_collections($schedule_id);
      $contents[] = implode(';', array_keys(current($collections)));
      foreach($collections as $collection) {
         $contents[] = implode(';', $collection);
      }
		$master_schedule_file = DIR_FTP_SCREENS."/$schedule_id.schedule";
		if (file_exists($master_schedule_file)) {
         unlink($master_schedule_file);
      }
	   file_put_contents($master_schedule_file, implode("\n", $contents));

	   $screens = $this->get_screens($schedule_id);
	   foreach($screens as $screen_id => $screen) {
         if (!file_exists(DIR_FTP_SCREENS."/$screen_id")) {
            mkdir(DIR_FTP_SCREENS."/$screen_id");
         } else if (!is_dir(DIR_FTP_SCREENS."/$screen_id")) {
            unlink(DIR_FTP_SCREENS."/$screen_id");
            mkdir(DIR_FTP_SCREENS."/$screen_id");
         }

   		$schedule_file = DIR_FTP_SCREENS."/$screen_id/$schedule_id.schedule";
	      if (file_exists($schedule_file)) {
	         unlink($schedule_file);
         }
	      link($master_schedule_file, $schedule_file);
      }
      unlink($master_schedule_file);
	}



}

?>
