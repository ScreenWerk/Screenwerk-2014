<?php

class Bundle_model extends Model {

	function __construct() {
		parent::Model();
	}



	function get_list() {
		$this->db->select('id, name');
		$this->db->from('bundles');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		$this->db->order_by('name'); 
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				unset($data[$row['id']]['id']);
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function get_one($id = NULL) {
	
		$this->db->select('id, name');
		$this->db->from('bundles');
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



	function get_name($id) {
		$this->db->select('name');
		$this->db->where('id', $id);
		$result = $this->db->get('bundles');
		
		if ($result->num_rows() > 0) return $result->row()->name;

	} 



	function get_names_list() {	
		$result = array();
		
		foreach($this->get_list() as $key => $value):
			$result[$key] = $value['name'];
		endforeach;
		
		return $result;
	} 



	function get_screens($id) {	
		$this->db->select('screens.id, screens.name');
		$this->db->from('screens');
		$this->db->join('collections_schedules', 'collections_schedules.schedule_id = screens.schedule_id', 'left');
		$this->db->join('layouts_collections', 'layouts_collections.collection_id = collections_schedules.collection_id', 'left');
		$this->db->join('bundles_layouts', 'bundles_layouts.layout_id = layouts_collections.layout_id', 'left');
		$this->db->where(array('bundles_layouts.bundle_id' => $id));
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				unset($data[$row['id']]['id']);
			}
		} else {
			$data = array();
		}

		return $data;
	} 



	function get_medias($id) {	
		$this->db->select('medias.id,
		                   medias_bundles.frequency,
		                   medias_bundles.probability,
		                   medias_bundles.valid_from_date,
		                   medias_bundles.valid_to_date');
		$this->db->from('medias');
		$this->db->join('medias_bundles', 'medias_bundles.media_id = medias.id', 'left');
		$this->db->where(array('medias_bundles.bundle_id' => $id));
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
	   $screens = $this->get_screens($id);
	   foreach($screens as $screen_id => $screen) {
	      @ unlink(DIR_FTP_SCREENS."/$screen_id/$id.bundle"); # ftp/screens/35/13.bundle
      }
		$this->db->where('id', $id);
		$this->db->delete('bundles');
	}



	function update() {
		$data = array(
			'name' => $this->input->post('name')
		);
		if($this->input->post('id') > 0) {
			$this->db->where('id', $this->input->post('id'));
			$this->db->update('bundles', $data);
			$this->update_fs($this->input->post('id'));
		} else {
			$data['customer_id'] = $_SESSION['user']['customer_id'];
			$this->db->insert('bundles', $data);
		}
	}



	function update_fs($id) {

		$master_bundle_file = DIR_FTP_SCREENS."/$id.bundle";  # ftp/screens/13.bundle
	   file_put_contents($master_bundle_file, array_keys($this->get_medias($id)));

	   $screens = $this->get_screens($id);
	   foreach($screens as $screen_id => $screen) {
         if (!file_exists(DIR_FTP_SCREENS."/$screen_id")) {
            mkdir(DIR_FTP_SCREENS."/$screen_id");
         } else if (!is_dir(DIR_FTP_SCREENS."/$screen_id")) {
            unlink(DIR_FTP_SCREENS."/$screen_id");
            mkdir(DIR_FTP_SCREENS."/$screen_id");
         }

   		$bundle_file = DIR_FTP_SCREENS."/$screen_id/$id.bundle";  # ftp/screens/35/13.bundle
	      unlink($bundle_file);
	      link($master_bundle_file, $bundle_file);
      }
      unlink($master_bundle_file); # ftp/screens/13.bundle
	}



}

?>
