<?php

class Layout_collection_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Layout_model', 'layout');
		$this->load->model('Collection_model', 'collection');
	}



	function get_list($layout_id = NULL, $collection_id = NULL) {
		$this->db->select('id, layout_id, collection_id, frequency, appearances, importance, probability, valid_from_date, valid_to_date');
		$this->db->from('layouts_collections');
		$this->db->where('customer_id', $this->sess->customer_id);
		if(isset($layout_id)) $this->db->where('layout_id', $layout_id);
		if(isset($collection_id)) $this->db->where('collection_id', $collection_id);
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
			}
		} else {
			foreach($query->field_data() as $row) {
				$data[0][$row->name] = NULL;
			}
			$data[0]['layout_id'] = $layout_id;
			$data[0]['collection_id'] = $collection_id;
		}

		return $data;
	}


	function delete($id) {
	   $layout_id_a = $this->input->post('layout_id');
	   $layout_id = $layout_id_a[$id];
	   $collection_id_a = $this->input->post('collection_id');
	   $collection_id = $collection_id_a[$id];

	   $this->layout->delete_fs($layout_id);

		$this->db->where('id', $id);
		$this->db->delete('layouts_collections');

	   $this->layout->update_fs($layout_id);
	   $this->collection->update_fs($collection_id);
	}



	function update() {

		$id = $this->input->post('id');
		$layout_id = $this->input->post('layout_id');
		$collection_id = $this->input->post('collection_id');
		$frequency = $this->input->post('frequency');
		$appearances = $this->input->post('appearances');
		$importance = $this->input->post('importance');
		$probability = $this->input->post('probability');
		$valid_from_date = $this->input->post('valid_from_date');
		$valid_to_date = $this->input->post('valid_to_date');
		
		foreach($id as $key => $value) {
			$data = array(
				'layout_id' => $layout_id[$key],
				'collection_id' => $collection_id[$key],
				'frequency' => $frequency[$key],
				'appearances' => $appearances[$key],
				'importance' => $importance[$key],
				'probability' => $probability[$key]
			);

			if($valid_from_date[$key]) $data['valid_from_date'] = date('Y-m-d', strtotime($valid_from_date[$key]));
			if($valid_to_date[$key]) $data['valid_to_date'] = date('Y-m-d', strtotime($valid_to_date[$key]));
			
			if($id[$key] > 0) {
				$this->db->where('id', $id[$key]);
				$this->db->update('layouts_collections', $data);
			} else {
				if($layout_id[$key] != 0 AND $collection_id[$key] != 0) {
					$data['customer_id'] = $this->sess->customer_id;
					$this->db->insert('layouts_collections', $data);
				}
			}
         $this->layout->update_fs($data['layout_id']);
         $this->collection->update_fs($data['collection_id']);
		}
		
	}






	function get_layouts_for_collection( $collection_id )
	{
      if( isset( $this->LayoutsForCollection[$collection_id] ) )
      {
         return $this->LayoutsForCollection[$collection_id];
      }
		$this->db->select('l.id, l.name, l.duration, lc.frequency, lc.appearances, lc.importance, lc.probability, lc.valid_from_date, lc.valid_to_date');
		$this->db->from('layouts_collections AS lc');
		$this->db->join('layouts AS l', 'l.id = lc.layout_id');
		$this->db->where('lc.customer_id', $this->sess->customer_id);
		$this->db->where('lc.collection_id', $collection_id);
		$this->db->order_by('lc.importance', 'desc'); 
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row)
			{
				$this->LayoutsForCollection[$collection_id][$row['id']] = $row;
				//unset($this->LayoutsForCollection[$collection_id][$row['id']]['id']);
			}
		} else {
			$this->LayoutsForCollection[$collection_id] = array();
		}

		return $this->LayoutsForCollection[$collection_id];
	}


}

?>
