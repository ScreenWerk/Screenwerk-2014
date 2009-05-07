<?php

class Media_bundle_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Media_model', 'media');
		$this->load->model('Bundle_model', 'bundle');
	}



	function get_list($media_id = NULL, $bundle_id = NULL) {
		$this->db->select('id, media_id, bundle_id, frequency, appearances, importance, probability, valid_from_date, valid_to_date');
		$this->db->from('medias_bundles');
		$this->db->where('customer_id', $this->sess->customer_id);
		if(isset($media_id)) $this->db->where('media_id', $media_id);
		if(isset($bundle_id)) $this->db->where('bundle_id', $bundle_id);
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
			}
		} else {
			foreach($query->field_data() as $row) {
				$data[0][$row->name] = NULL;
			}
			$data[0]['media_id'] = $media_id;
			$data[0]['bundle_id'] = $bundle_id;
		}
		//print_r($data);

		return $data;
	}



	function get_one($id = NULL) {
	
		$this->db->select('id, media_id, bundle_id, frequency, appearances, importance, probability, valid_from_date, valid_to_date');
		$this->db->from('medias_bundles');
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



	function delete($id) {
	   $bundle_id_a = $this->input->post('bundle_id');
	   $bundle_id = $bundle_id_a[$id];
	   
		$this->db->where('id', $id);
		$this->db->delete('medias_bundles');

	   $this->bundle->update_fs($bundle_id);
	}


	function update() {
		
		$id = $this->input->post('id');
		$media_id = $this->input->post('media_id');
		$bundle_id = $this->input->post('bundle_id');
		$frequency = $this->input->post('frequency');
		$appearances = $this->input->post('appearances');
		$importance = $this->input->post('importance');
		$probability = $this->input->post('probability');
		$valid_from_date = $this->input->post('valid_from_date');
		$valid_to_date = $this->input->post('valid_to_date');
		
		foreach($id as $key => $value) {
			$data = array(
				'media_id' => $media_id[$key],
				'bundle_id' => $bundle_id[$key],
				'frequency' => $frequency[$key],
				'appearances' => $appearances[$key],
				'importance' => $importance[$key],
				'probability' => $probability[$key]
			);
			if($valid_from_date[$key]) $data['valid_from_date'] = date('Y-m-d', strtotime($valid_from_date[$key]));
			if($valid_to_date[$key]) $data['valid_to_date'] = date('Y-m-d', strtotime($valid_to_date[$key]));
			
			if($id[$key] > 0) {
				$this->db->where('id', $id[$key]);
				$this->db->update('medias_bundles', $data);
			} else {
				if($media_id[$key] != 0 AND $bundle_id[$key] != 0) {
					$data['customer_id'] = $this->sess->customer_id;
					$this->db->insert('medias_bundles', $data);
				}
			}
		}
      $this->bundle->update_fs($data['bundle_id']); // renew bundle file for synchronization with screens
		
	}



	function get_medias_for_bundle( $bundle_id ) {
      if( isset( $this->MediasForBundle[$bundle_id] ) )
      {
         return $this->MediasForBundle[$bundle_id];
      }
		$this->db->select('mb.id, m.id as media_id, m.type, m.filename, m.duration, mb.frequency, mb.appearances, mb.importance, mb.probability, mb.valid_from_date, mb.valid_to_date');
		$this->db->from('medias_bundles AS mb');
		$this->db->join('medias AS m', 'm.id = mb.media_id');
		$this->db->where('mb.customer_id', $this->sess->customer_id);
		$this->db->where('mb.bundle_id', $bundle_id);
		$this->db->order_by('mb.importance', 'desc'); 
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row)
			{
				$this->MediasForBundle[$bundle_id][$row['id']] = $row;
				//unset($this->MediasForBundle[$collection_id][$row['id']]['id']);
			}
		} else {
			$this->MediasForBundle[$bundle_id] = array();
		}

		return $this->MediasForBundle[$bundle_id];
	}

}

?>
