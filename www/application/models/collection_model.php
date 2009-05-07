<?php

class Collection_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Dimension_model', 'dimension');
	}



	function get_list() {
		$this->db->select('id, name, dimension_id');
		$this->db->from('collections');
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
		$this->db->from('collections');
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
		$result = $this->db->get('collections');
		
		if ($result->num_rows() > 0) return $result->row()->name;

	} 



	function get_names_list() {
		$result = array();
		
		foreach($this->get_list() as $key => $value):
			$result[$key] = $value['name'];
		endforeach;
		
		return $result;
	} 



	function get_screens($collection_id) {	
		$this->db->select('screens.id, screens.name');
		$this->db->from('screens');
		$this->db->join('collections_schedules', 'collections_schedules.schedule_id = screens.schedule_id', 'left');
		$this->db->where(array('collections_schedules.collection_id' => $collection_id));
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



	function get_layouts($collection_id) {	
		$this->db->select('layouts.id,
                         layouts.duration,
		                   layouts_collections.frequency,
		                   layouts_collections.probability,
		                   layouts_collections.valid_from_date,
		                   layouts_collections.valid_to_date');
		$this->db->from('layouts');
		$this->db->join('layouts_collections', 'layouts_collections.layout_id = layouts.id', 'left');
		$this->db->where(array('layouts_collections.collection_id' => $collection_id));
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
		$this->db->delete('collections');
	}



	function update() {
		$data = array(
			'name' => $this->input->post('name'),
			'dimension_id' => $this->input->post('dimension')
		);
		if($this->input->post('id') > 0) {
			$this->db->where('id', $this->input->post('id'));
			$this->db->update('collections', $data);
			$this->update_fs($this->input->post('id'));
		} else {
			$data['customer_id'] = $this->sess->customer_id;
			$this->db->insert('collections', $data);
		}
	}


	function delete_fs($collection_id) {
	   //TODO: right now orphan layout files are remaining,
	   // plan is to remove all related layout files and refresh them
	   // after collection is unlinked.
 	   $screens = $this->get_screens($collection_id);
	   foreach($screens as $screen_id => $screen) {
	      @ unlink(DIR_FTP_SCREENS."/$screen_id/$collection_id.collection");
      }
	}



	function update_fs($collection_id) {
      if($collection_id==0) return;
      
      $layouts = $this->get_layouts($collection_id);
      $contents[] = implode(';', array_keys(current($layouts)));
      foreach($layouts as $layout) {
         $contents[] = implode(';', $layout);
      }
		$master_collection_file = DIR_FTP_SCREENS."/$collection_id.collection";
		if (file_exists($master_collection_file)) {
         unlink($master_collection_file);
      }
	   file_put_contents($master_collection_file, implode("\n", $contents));

	   $screens = $this->get_screens($collection_id);
	   foreach($screens as $screen_id => $screen) {
         if (!file_exists(DIR_FTP_SCREENS."/$screen_id")) {
            mkdir(DIR_FTP_SCREENS."/$screen_id");
         } else if (!is_dir(DIR_FTP_SCREENS."/$screen_id")) {
            unlink(DIR_FTP_SCREENS."/$screen_id");
            mkdir(DIR_FTP_SCREENS."/$screen_id");
         }

   		$collection_file = DIR_FTP_SCREENS."/$screen_id/$collection_id.collection";
	      if (file_exists($collection_file)) {
	         unlink($collection_file);
         }
	      link($master_collection_file, $collection_file);
      }
      unlink($master_collection_file);
	}



}

?>
