<?
class Collection_model extends Model {
    
    function __construct()
    {
        parent::Model();
        $this->load->model('Dimension_model','Dimension',TRUE);
        $this->load->model('Layout_model','Layout',TRUE);
    }
    
    
    
    function find($id)
    {
        $this->db->where('id='.$id);
        $query = $this->db->get( 'collections' );
        return $query->row_array();
    }
    
    
    
   function involved_medias($id)
   {
      $_involved_medias = array();
      
      $CollectionLayouts = $this->list_collection_layouts($id);
      foreach( $CollectionLayouts as $_cl_id => $CollectionLayout )
      {
         $_lim = $this->Layout->involved_medias( $_cl_id );
         $_involved_medias = array_merge( $_involved_medias, $_lim );
      }
      array_multisort( array_keys($_involved_medias), $_involved_medias );
#      var_dump($_involved_medias);
      return ($_involved_medias);
   }      
    
    
    
   function list_collection_layouts($id)
   {
      $ret_layouts = array();
      if( isset( $this->ListCollectionLayouts[$id] ) ) return $this->ListCollectionLayouts[$id];
      
      $query = $this->db->query( 'SELECT l.id, l.name, l.length, lc.frequency, lc.appearances, lc.importance, lc.probability, lc.valid_from_date, lc.valid_to_date FROM sw_layouts l
left join sw_layouts_collections lc on lc.layout_id = l.id
where lc.collection_id = '.$id.'
order by lc.importance desc' );
      foreach( $query->result_array() as $_layout )
      {
         $_id = $_layout['id'];
         unset( $_layout['id'] );
         $ret_layouts[$_id] = $_layout;
      }
      $this->ListCollectionLayouts[$id] = $ret_layouts;
      return $ret_layouts;
   }
   
   
   
   function list_layouts_excl($id)
   {
      $ret_layouts = array();

      $query = $this->db->query( 'SELECT id, name FROM sw_layouts
where id not in
( SELECT distinct l.id FROM sw_layouts l 
left join sw_layouts_collections lc on lc.layout_id = l.id
where lc.collection_id = '.$id.' )
order by name' );
      foreach( $query->result_array() as $_layout )
      {
         $ret_layouts[$_layout['id']] = $_layout['name'];
      }
      return $ret_layouts;
   }
   
   
   
   function add_layout()
   {
      $CL['collection_id'] = $_POST['id'];
      $CL['layout_id'] = $_POST['layout_id'];
      $CL['frequency'] = $_POST['frequency'];
      $CL['appearances'] = $_POST['appearances'];
      $CL['importance'] = $_POST['importance'];
      $CL['probability'] = $_POST['probability'];
      $CL['valid_from_date'] = $_POST['valid_from_date'];
      $CL['valid_to_date'] = $_POST['valid_to_date'];
      $this->db->insert( 'layouts_collections', $CL );
   }
   
   
   
   function remove_layout( $collection_id, $layout_id )
   {
      $CL['collection_id'] = $collection_id;
      $CL['layout_id'] = $layout_id;
      $this->db->delete( 'layouts_collections', $CL );
   }
   
   
   
   
   
   
   
    function delete($id)
    {
        $this->db->where( 'collection_id=' . $id );
        $this->db->delete( 'collections_schedules' );

        $this->db->where( 'id=' . $id );
        $this->db->delete( 'collections' );
    }
    function get_last_ten()
    {
        $query = $this->db->get('collections', 10);
        return $query->result_array();
    }
    
    function create($name,$width,$height)
    {
        $Dimension = $this->Dimension->createfind($width,$height);
        return $this->insert($name,$Dimension['id']);
    }
    function insert($name,$dimension_id)
    {
        $Collection['dimension_id'] = $dimension_id;
        $Collection['name'] = $name;
        $this->db->where($Collection);
        $query = $this->db->get('collections');
        if( $query->num_rows() == 1 )
        {
            return $query->row_array();
        }
        $this->db->insert( 'collections', $Collection );
        $Collection['id'] = $this->db->insert_id();
        return $Collection;
    }



   function save($Collection)
   {
      return $this->update($Collection['id'],$Collection['name'],$Collection['dimension_id']);
   }
   
   function update($id,$name,$dimension_id)
   {
      $Collection['id'] = $id;
      $this->db->where($Collection);
      $Collection['name'] = $name;
      $Collection['dimension_id'] = $dimension_id;
      $this->db->update('collections',$Collection);
   }

}
?>
