<?
class Customer_model extends Model {

   function __construct()
   {
      parent::Model();
   }
   
   
   function get_users($id)
   {
      $this->db->where('customer_id='.$id);
      $query = $this->db->get( 'users' );

      $_ra1 = $query->result_array();
      
      foreach( $_ra1 as $_r )
      {
         $_ra2[$_r['username']] = $_r;
      }

      return $_ra1;
   }


   function create($name)
   {
      return $this->insert($name);
   }


   function insert($name)
   {
      $Customer['name'] = $name;
      $this->db->where($Customer);
      $query = $this->db->get('customers');
      if( $query->num_rows() == 1 )
      {
         return $query->row_array();
      }
      $this->db->insert( 'customers', $Customer );
      $Customer['id'] = $this->db->insert_id();
      return $Customer;
   }


   function save($Customer)
   {
      return $this->update($Customer['id'],$Customer['name']);
   }
   
   function update($id,$name)
   {
      $Customer['id'] = $id;
      $this->db->where($Customer);
      $Customer['name'] = $name;
      $this->db->update('customers',$Customer);
   }

}
?>
