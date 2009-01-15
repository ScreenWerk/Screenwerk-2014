<?php

class Screen_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Dimension_model', 'dimension');
		$this->load->model('Schedule_model', 'schedule');
	}



	function get_list() {

		$this->db->select('id, name, schedule_id, dimension_id, content_md5');
		$this->db->from('screens');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		$this->db->order_by('name'); 
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				$data[$row['id']]['dimension'] = $this->dimension->get_name($row['dimension_id']);
				$data[$row['id']]['schedule'] = $this->schedule->get_name($row['schedule_id']);
				unset($data[$row['id']]['dimension_id']);
				unset($data[$row['id']]['schedule_id']);
				unset($data[$row['id']]['id']);

				$data[$row['id']]['synchronized'] =
				    ( $data[$row['id']]['content_md5'] == $this->md5( $row['id'] ) ) ?
				    'Yes' : 'No'; 
            unset( $data[$row['id']]['content_md5'] );
            
			}
		} else {
			$data = array();
		}
		
		return $data;

	}



	function get_one($id = NULL) {
		
		$this->db->select('id, name, schedule_id, dimension_id');
		$this->db->from('screens');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
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



	function delete($id) {
      $this->delete_fs($id);
		$this->db->where('id', $id);
		$this->db->delete('screens');
	}



	function update() {
		$data = array(
			'name' => $this->input->post('name'),
			'schedule_id' => $this->input->post('schedule'),
			'dimension_id' => $this->input->post('dimension')
		);
		if($this->input->post('id') > 0) {
			$this->db->where('id', $this->input->post('id'));
			$this->db->update('screens', $data);
			$this->update_fs($this->input->post('id'));
		} else {
			$data['customer_id'] = $_SESSION['user']['customer_id'];
			$this->db->insert('screens', $data);
		}
	}



	function delete_fs($screen_id) {
	   //TODO: right now orphan layout files are remaining,
	   // plan is to remove all related layout files and refresh them
	   // after collection is unlinked.
      @ unlink(DIR_FTP_SCREENS."/$screen_id/$screen_id.screen");
	}



	function update_fs($screen_id) {
      if($screen_id==0) return;
      
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



	function md5($id) {

		$this->db->select('s.change_date AS s, cs.change_date AS cs, c.change_date AS c, lc.change_date AS lc, l.change_date AS l, bl.change_date AS bl, b.change_date AS b, mb.change_date AS mb, m.change_date AS m');
		$this->db->from('screens');
		$this->db->join('schedules AS s', 's.id = screens.schedule_id');
		$this->db->join('collections_schedules AS cs', 'cs.schedule_id = s.id');
		$this->db->join('collections AS c', 'c.id = cs.collection_id');
		$this->db->join('layouts_collections AS lc', 'lc.collection_id = c.id');
		$this->db->join('layouts AS l', 'l.id = lc.layout_id');
		$this->db->join('bundles_layouts AS bl', 'bl.layout_id = l.id');
		$this->db->join('bundles AS b', 'b.id = bl.bundle_id');
		$this->db->join('medias_bundles AS mb', 'mb.bundle_id = b.id');
		$this->db->join('medias AS m', 'm.id = mb.media_id');
		$this->db->where('screens.id', $id);
		$query = $this->db->get();
	
		$md5_string = '';
	
		foreach($query->result_array() as $row) {
			$md5_string .= implode(';', $row);
		}
		
		return md5($md5_string);
		
	}

}

?>
