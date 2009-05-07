<?php

class Layout_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Dimension_model', 'dimension');
	}



	function get_list() {
		$this->db->select('id, name, dimension_id, duration');
		$this->db->from('layouts');
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
	
		$this->db->select('id, name, dimension_id, duration');
		$this->db->from('layouts');
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
		$result = $this->db->get('layouts');
		
		if ($result->num_rows() > 0) return $result->row()->name;

	} 



	function get_names_list() {
		$result = array();
		
		foreach($this->get_list() as $key => $value):
			$result[$key] = $value['name'];
		endforeach;
		
		return $result;
	} 



	function get_screens($layout_id) {	
		$this->db->select('screens.id, screens.name');
		$this->db->from('screens');
		$this->db->join('collections_schedules', 'collections_schedules.schedule_id = screens.schedule_id', 'left');
		$this->db->join('layouts_collections', 'layouts_collections.collection_id = collections_schedules.collection_id', 'left');
		$this->db->where(array('layouts_collections.layout_id' => $layout_id));
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



	function get_bundles($layout_id) {	
		$this->db->select('bundles.id,
		                   bundles_layouts.position_x,
		                   bundles_layouts.position_y,
		                   bundles_layouts.position_z,
		                   dimensions.dimension_x,
		                   dimensions.dimension_y,
		                   bundles_layouts.start_sec,
		                   bundles_layouts.stop_sec');
		$this->db->from('bundles');
		$this->db->join('bundles_layouts', 'bundles_layouts.bundle_id = bundles.id', 'left');
		$this->db->join('dimensions', 'dimensions.id = bundles_layouts.dimension_id', 'left');
		$this->db->where(array('bundles_layouts.layout_id' => $layout_id));
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
		$this->db->delete('layouts');
	}



	function update() {
		$data = array(
			'name' => $this->input->post('name'),
			'dimension_id' => $this->input->post('dimension'),
			'duration' => $this->input->post('duration')
		);
		if($this->input->post('id') > 0) {
			$this->db->where('id', $this->input->post('id'));
			$this->db->update('layouts', $data);
			$this->update_fs($this->input->post('id'));
		} else {
			$data['customer_id'] = $this->sess->customer_id;
			$this->db->insert('layouts', $data);
		}
	}



	function delete_fs($layout_id) {
	   //TODO: right now orphan bundle files are remaining,
	   // plan is to remove all related bundle files and refresh them
	   // after layout is removed from DB.
 	   $screens = $this->get_screens($layout_id);
	   foreach($screens as $screen_id => $screen) {
	      @ unlink(DIR_FTP_SCREENS."/$screen_id/$layout_id.layout");
      }
	}



	function update_fs($layout_id) {
      if($layout_id==0) return;
      
      $bundles = $this->get_bundles($layout_id);
      $contents[] = implode(';', array_keys(current($bundles)));
      foreach($bundles as $bundle) {
         $contents[] = implode(';', $bundle);
      }
		$master_layout_file = DIR_FTP_SCREENS."/$layout_id.layout";
		if (file_exists($master_layout_file)) {
         unlink($master_layout_file);
      }
	   file_put_contents($master_layout_file, implode("\n", $contents));

	   $screens = $this->get_screens($layout_id);
	   foreach($screens as $screen_id => $screen) {
         if (!file_exists(DIR_FTP_SCREENS."/$screen_id")) {
            mkdir(DIR_FTP_SCREENS."/$screen_id");
         } else if (!is_dir(DIR_FTP_SCREENS."/$screen_id")) {
            unlink(DIR_FTP_SCREENS."/$screen_id");
            mkdir(DIR_FTP_SCREENS."/$screen_id");
         }

   		$layout_file = DIR_FTP_SCREENS."/$screen_id/$layout_id.layout";
	      if (file_exists($layout_file)) {
	         unlink($layout_file);
         }
	      link($master_layout_file, $layout_file);
      }
      unlink($master_layout_file);
	}



}

?>
