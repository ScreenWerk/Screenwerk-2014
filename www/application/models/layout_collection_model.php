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
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		if(isset($layout_id)) $this->db->where('layout_id', $layout_id);
		if(isset($collection_id)) $this->db->where('collection_id', $collection_id);
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				unset($data[$row['id']]['id']);
				$data[$row['id']]['collection'] = $this->collection->get_name($row['collection_id']);
				$data[$row['id']]['layout'] = $this->layout->get_name($row['layout_id']);
			}
		} else {
			$data = array();
		}

		return $data;
	}


	function get_layouts_for_collection( $collection_id )
	{
      if( isset( $this->LayoutsForCollection[$collection_id] ) )
      {
         return $this->LayoutsForCollection[$collection_id];
      }
		$this->db->select('l.id, l.name, l.length, lc.frequency, lc.appearances, lc.importance, lc.probability, lc.valid_from_date, lc.valid_to_date');
		$this->db->from('layouts_collections AS lc');
		$this->db->join('layouts AS l', 'l.id = lc.layout_id');
		$this->db->where('lc.customer_id', $_SESSION['user']['customer_id']);
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
